
const express=require('express');
const uuid=require('uuid/v4');
const bodyParser = require('body-parser');
const app=express();
app.use(bodyParser.json());
const TaskManager=require('./task_runner');
const tasks=new TaskManager();
app.post("/tasks", async (req, res)=>{
    const tid=await tasks.startTask(req.body.request, req.body.image);
    // Force async-task.
    const task=await tasks.getTask(tid);
    await tasks.runTaskOnContainer(tid, req.body.image);
    const result=await tasks.waitForTask(tid);
    res.json(result);
});

app.get("/tasks/:id", async (req, res)=>{
    const task_id=req.params.id;
    const task=await tasks.getTask(task_id);
    if(task){
        res.json(task);
    }else{
        res.status(404).json({"error": "not found"});
    }
});


app.listen(8008, ()=>{
    console.log('laser-proxy started.');
});