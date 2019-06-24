const express=require('express');
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser());
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const { Pool } = require('pg')
const pool = new Pool({"host":"10.0.0.17", "port": 5432, "user": "postgres", "password": "postgres"});
const minio=require('./minio');
const k8sApi = kc.makeApiClient(k8s.Apps_v1beta2Api);
const service_api = kc.makeApiClient(k8s.Core_v1Api);
const fs=require('fs');
const Mustache=require('mustache');
const deployment_template=(fs.readFileSync("function_instance.json", "utf-8"));
const service_template=(fs.readFileSync("function_instance_service.json", "utf-8"));
Mustache.parse(deployment_template);
Mustache.parse(service_template);
const sleep=(timeout)=>new Promise(resolve=>setTimeout(resolve, 1000));
async function wait_for_deployment(deployment_id, status_hint){
    if(status_hint){
        if(status_hint.body.status.conditions.find((x)=>x.type=="Available").status=="True"){
            return true;
        }else if(status_hint.body.status.conditions.find((x)=>x.type=="Progressing").status=="False"){
            return false;
        }
    }
    for(let i=0;i<30;i++){
        await sleep(1000);
        let deployment_status=await k8sApi.readNamespacedDeploymentStatus("app-"+deployment_id, "laserapp");
        if(deployment_status.body.status.conditions.find((x)=>x.type=="Available").status=="True"){
            return true;
        }else if(deployment_status.body.status.conditions.find((x)=>x.type=="Progressing").status=="False"){
            return false;
        }
    }
    return false;

}
app.get("/pulse/:bundle", async (req, res)=>{
    console.log("pulse on "+req.params.bundle);
    // The function to really pulse a bundle.
    let deployment_status=null;
    try{
        deployment_status=await k8sApi.readNamespacedDeploymentStatus("app-"+req.params.bundle, "laserapp");
    }catch(err){
        // Deployment not found. Start one.
        try{
            let p1=service_api.createNamespacedService("laserapp",JSON.parse(Mustache.render(service_template, {
                "instance_name": req.params.bundle
            })));
            
	    const minio_url=await minio.presignedUrl("GET", "laser", req.params.bundle, 60*15);
            let p2=k8sApi.createNamespacedDeployment("laserapp", JSON.parse(Mustache.render(deployment_template, {
                "instance_name": req.params.bundle,
                "replicas": 1,
                "download_url": minio_url,
                "runtime_image": "local.insecure-registry.io/laser-runtime",
                "sidecar_image": "local.insecure-registry.io/laser-sidecar"
            })));
            await (p1.catch(()=>console.log("Create service failed")));
            await (p2.catch(()=>console.log("Create deployment failed")));
        }catch(err){
            console.log("Error!");
            console.log(err);
            // Do nothing.
        }

    }
    // Anyway, wait for the deployment.
    const wait_result=await wait_for_deployment(req.params.bundle, deployment_status).catch(console.log);
    res.json({"running": wait_result});
});

app.get("/query_api/:host", async (req, res)=>{
    //const client=await pool.connect();
    //const {rows}=await client.query();
    console.log(req.params.host)
    const host=req.params.host;
    const first=host.split(".")[0];
    if(first+".app.laser.gjz010.com"!=host) {
        res.status(404).end()
        return;
    }
    const ret=await pool.query("select id from api where id=$1;", [first]);
    if(ret.rowCount==0) return res.status(404).end();
    res.json({"api_name": first});
});

app.get("/fetch_api/:api", async (req, res)=>{
    const client=await pool.connect();
    const {rows}=await client.query("select compiled_api_spec as spec from api where id=$1;", [req.params.api]);
    client.release();
    if(rows.length==0){
        return res.status(404).json({"error": "not found"});
    }
    res.json(JSON.parse(rows[0].spec));
});
app.post("/flush_bundle/:bundle", async (req, res)=>{
    await k8sApi.replaceNamespacedDeploymentScale(req.params.bundle, "laserapp", {"metadata": {"name": req.params.bundle, "namespace": "laserapp"},"spec": {"replicas": 0}})
    await k8sApi.deleteNamespacedDeployment(req.params.bundle, "laserapp", "false", {}, "false", 0, "false", "Foreground");
    res.sendStatus(204);
});
app.listen(80, ()=>{
    console.log("scheduler ready");

})
