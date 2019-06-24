const express=require('express');
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser.json());
const axios=require('axios');
const bluebird=require('bluebird');
const redis=require('redis').createClient();
bluebird.promisifyAll(redis);
redis.on("error", console.log)

const dnscache = require('dnscache')({
    "enable" : true,
    "ttl" : 300,
    "cachesize" : 1000
});
bluebird.promisifyAll(dnscache);
async function cache_bundle_pulse(function_bundle){
    const ret=await redis.getAsync("laser-fb-cache-"+function_bundle);
    if(ret==null) return null;
    return ret=="1";
}
async function invalidate_bundle_cache(function_bundle){
    return redis.delAsync("laser-fb-cache-"+function_bundle);
}

async function cached_get_functions(api){
    const key=(`laser-api-cache-${api}`);
    const functions_list=await redis.getAsync(key);
    if(functions_list==null){
        const domain=`scheduler.laser.svc.cluster.local`;
        const ip=await dnscache.resolve4Async(domain);
        if(ip.length==0) throw ({"code": "ENOTFOUND"});
        const result=await axios.get("http://"+ip[0]+"/fetch_api/"+api);
        const list=result.data;
        await redis.setAsync(key, JSON.stringify(list), "EX", 300);
        return list;
    }else{
        return JSON.parse(functions_list);
    }
}
async function cached_get_api(host){
    const key=(`laser-apiname-cache-${host}`);
    const api_name=await redis.getAsync(key);
    if(api_name==null){
        const domain=`scheduler.laser.svc.cluster.local`;
        try{
            const ip=await dnscache.resolve4Async(domain);
            if(ip.length==0) throw ({"code": "ENOTFOUND"});
            const result=await axios.get("http://"+ip[0]+"/query_api/"+host);
            const name=result.data.api_name;
            await redis.setAsync(key, name, "EX", 300);
            return name;
        }catch(err){
            return null;
        }
    }else{
        return api_name;
    }
}
function resolve_path(api_list, path, method){
    method=method.toUpperCase();
    let steps=path.split("/");
    if(steps[0]=="") steps.shift();
    if(steps[steps.length-1]=="") steps.pop();
    let args=[];
    let current=api_list;
    for(let elem of steps){
        if(current.next[elem]){
            current=current.next[elem];
        }else if(current.next_any){
            args.push(elem);
            current=current.next_any;
        }else return null;
    }
    if(!current.methods[method]) return null;
    let arg_tree={};
    for(let argid in current.methods[method].arguments){
        let argname=current.methods[method].arguments[argid];
        arg_tree[argname]=args[argid];
    }
    const ret=Object.assign({arg_tree}, current.methods[method]);
    return ret;
}

async function bundle_pulse(function_bundle){
    // sends a pulse to scheduler.
    // If the deployment is up, the pulse returns immediately (running or crashed). The scheduler does the update.
    // To accelerate the pulse, scheduler maintains a cache with shorter timeout and limited space.
    // If the deployment is down, when scheduler accepts the pulse, it should try to spin up the container.
    const domain=`scheduler.laser.svc.cluster.local`;
    const ip=await dnscache.resolve4Async(domain);
    if(ip.length==0) throw ({"code": "ENOTFOUND"});
    const result=await axios.get("http://"+ip[0]+"/pulse/"+function_bundle);
    // async set cache.
    redis.setAsync("laser-fb-cache-"+function_bundle, (result.data.running)?"1":"0", "EX", 300);
    return result.data.running;
}

async function handle_request(function_bundle, function_name, req, res, path_arguments, use_cache){
    let running=false;
    let cached=false;
    if(use_cache){
        cached=true;
        console.log("find from cache");
        running=await cache_bundle_pulse(function_bundle);
        if(running==null){
            console.log("cache miss");
            cached=false;
            running=await bundle_pulse(function_bundle);
        }
    }else{
        console.log("not using cache");
        running=await bundle_pulse(function_bundle);
    }
    if(running){
        console.log("start fetch");
        // Now the service should be alive.
        const domain=`app-${function_bundle}.laserapp.svc.cluster.local`;
        try{
            const ip=await dnscache.resolve4Async(domain);
            if(ip.length==0) throw ({"code": "ENOTFOUND"});
            const f=await axios.post("http://"+ip[0]+"/"+function_name, 
            {
                "params": path_arguments,
                "query":  req.query,
                "body": req.body,
                "headers": {
                    "authorization": req.header("Authorization"),
                    "content-type": req.header("Content-Type"),
                }
            });
            console.log(function_name)
            console.log(f.data);
            if(f.data.errcode){
                return res.status(f.data.errcode).end();
            }
            if(f.data.result.code) res.status(f.data.result.code);
            
            if(f.data.result.body) res.json(f.data.result.body);
            else res.end();
            console.log("fetch end")
        }catch(err){
            console.log(err);
            if((err.code=="ECONNREFUSED" || err.code=="ENOTFOUND" || err.code=="ECONNRESET") && cached){ //if Cache said yes but we got no.
                // The cache is invalid. Try again.
                invalidate_bundle_cache(function_bundle);
                return handle_request(function_bundle, function_name, req, res, path_arguments, false);
            }
            if(err.errcode){
                res.status(err.errcode);
            }else{
                res.status(500);
            }
            res.json({"error": err});
        }

    }else{
        return res.status(500).json({"error": "the function bundle crashed upon loading."});
    }
    
    
}

app.all("*", async (req, res)=>{
    console.log(req.hostname, req.host)
    const host=req.host;
    console.log("cached_get_api");
    const api_name=await cached_get_api(host);
    if(!api_name) return res.status(404).end();
    console.log("cached_get_functions");
    const functions=await cached_get_functions(api_name);
    console.log("resolve_path");
    let resolve_result=await resolve_path(functions, req.path, req.method);
    if(!resolve_result){
        await res.status(404).end();
        return;
    }
    const {bundle, fname, arg_tree}=resolve_result;
    if(!bundle) return res.status(404).end();
    console.log("handling");
    handle_request(bundle, fname, req, res, arg_tree, true);
    console.log("handle done");
});

app.listen(80, ()=>{
    console.log("ready");
})