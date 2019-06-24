const express=require('express');
const bodyParser=require('body-parser');
const app=express();
var cors = require('cors')
app.use(bodyParser.json());
app.use(cors())
const process=require('process');
const api_spec=require(process.argv[2]);

const path=require('path');

const compiler=require('./openapi-compiler.js');

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

async function main(){
    console.log("Compiling given api spec...");
    const {nodes} =compiler.get_interfaces(api_spec);
    const bundle_path=process.argv[3] || "../";
    const prelude=require(path.resolve(bundle_path, "prelude.js"));
    await prelude();
    app.all("*", async (req, res)=>{
        try{
            const method=resolve_path(nodes, req.path, req.method);
            if(!method){
                return res.sendStatus(404);
            }
            const func=require(path.resolve(bundle_path, "func", method.op));
            const reqbody={
                "params": method.arg_tree,
                "query":  req.query,
                "body": req.body,
                "headers": {
                    "authorization": req.header("Authorization"),
                    "content-type": req.header("Content-Type"),
                }
            };
            const result=await func(reqbody);
            res.status(result.code||500);
            if(result.body) res.json(result.body);
            else res.end();
        }catch(err){
            console.log(err);
            res.sendStatus(500);
        }
    });
    app.listen(7654, ()=>{
        console.log("debug-server started");
    });

}

main().catch(console.log);