const express=require('express');
const bodyParser=require('body-parser');
const fs=require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const process=require('process');
async function main(){
    const app=express();
    app.use(bodyParser.json());
    //const prelude=require("/mod/prelude");
    // Allows user to do some initialization.
    //await prelude();
    app.post("/:func", async (req, res)=>{
        const func_name=req.params["func"];
        const body=req.body;
        try{
            require("/mod/func/"+func_name);
        }catch(err){
            res.json({"errcode": 404, "error": "function not found."});
            return;
        }
        try{
            const func=require("/mod/func/"+func_name);
            const ret=await func(body);
            res.json({"result":ret});
        }catch(err){
            res.json({"error": err});
            
        }
        
    });
    app.listen("/mod/user.sock", ()=>{
        console.log("user service started.");
    });

}

main().catch(console.log);
