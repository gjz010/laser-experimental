const container=require('./container');
const {Etcd3}=require('etcd3');
const bluebird=require('bluebird');
const etcd=new Etcd3();
bluebird.promisifyAll(etcd);
const uuid=require('uuid/v4');
const invoke=require('./invoke');
const {EventEmitter}=require('events');
class BoxInstance{
    constructor(image_manager){
        this.state="uninitialized";
        this.image_manager=image_manager;
        this.ev=new EventEmitter();
    }
    getID(){
        return this.box.id;
    }
    async spinup(){
        const self=this;
        this.box=await container.createContainer(uuid());
        this.box.event.on("exit", async()=>{
            await self.cleanup();
        })
        this.state="init";
        //register some events.
        const occupy_lock="laser.free_containers."+this.box.id;
        const task_lock="laser.grabbed_containers."+this.box.id;
        const differenciate_log="laser.differenciate_log."+this.box.id;
        const watcher=await etcd.watch().withPreviousKV().key(occupy_lock).create();
        watcher.on('put', async (res, prev)=>{
            console.log("free_container put detected");
            const val=res.value.toString();
            console.log(prev);
            if(prev && prev.value.toString()=="0"){
                
                // This is a lock operation.
                console.log("lock op");
                const lock_op=JSON.parse(val);
                //Delete the key.
                await etcd.delete().key(occupy_lock);
                await watcher.cancel();
                let image_id=lock_op.image_id;
                console.log(image_id);
                if(!image_id){
                    // this is a pre-grabbed container.
                    image_id=await new Promise(async (resolve)=>{
                        const grab_watcher=await etcd.watch().key(task_lock).create();
                        grab_watcher.once('put', async (res)=>{
                            resolve(res.value.toString());
                            // self-cleanup.
                            await grab_watcher.cancel();
                        });
                    });
                }
                
                let task_id=lock_op.task_id;
                // In any case, the runner knows the image and starts to differenciate.
                try{
                    await this.image_manager.ensureImage(image_id);
                    await self.startImage(image_id);
                    await etcd.put(differenciate_log).value(JSON.stringify({"result":"success"}));
                    
                }catch(err){
                    console.log(err);
                    await etcd.put(differenciate_log).value(JSON.stringify({"result":"failed"}));
                    return;
                }
                self.imaged_occupy_lock="laser.loaded_functions."+image_id+"."+self.box.id;
                console.log(task_id);
                if(task_id){
                    // Some task is specified.
                    // So do the task first.
                    await self.solveTask(task_id);
                }
                
                self.task_watcher=await etcd.watch().withPreviousKV().key(self.imaged_occupy_lock).create();
                console.log(self.imaged_occupy_lock);
                self.task_watcher.on("put", async (res, prev)=>{
                    console.log(self.imaged_occupy_lock);
                    const val=res.value.toString();
                    if(prev && prev.value.toString()=="0"){
                        // A lock on imaged_occupy_lock.
                        console.log("delete");
                        await etcd.delete().key(self.imaged_occupy_lock);
                        // Solve task here.
                        console.log("solve");
                        await self.solveTask(val);
                        // and reset the lock.
                        console.log("put");
                        await etcd.put(self.imaged_occupy_lock).value("0");
                        console.log("done");
                    }
                });
                console.log(self.imaged_occupy_lock);
                await etcd.put(self.imaged_occupy_lock).value("0");
            }
        });
        // unlock now to start the container.
        await etcd.put(occupy_lock).value("0");
        
    }
    async solveTask(task_id){
        //TODO: pricing can be done here.
        console.log("solving task "+task_id);
        const task=await etcd.get("laser.tasks."+task_id).json();
        if(task.response) return; //This should not happen.
        const req=task.request;
        console.log(JSON.stringify(req));
        const func=await this.box.rpc.functionInvoke({"Content": JSON.stringify(req)});
        const response=await new Promise((resolve)=>{
            func.once('data', (obj)=>{
                resolve(obj)
            });
        });
        Object.assign(task, {"response": JSON.parse(response.Content)});
        await etcd.put("laser.tasks."+task_id).value(JSON.stringify(task));
    }
    async startImage(image_id){
        this.state="running";
        await container.startJob(this.box, image_id);
    }
    async cleanup(){
        const remover=etcd.delete()
        .key("laser.free_containers."+this.box.id)
        .key("laser.grabbed_containers."+this.box.id)
        .key("laser.differenciate_log."+this.box.id);
        if(this.imaged_occupy_lock){
            remover=remover.key(this.imaged_occupy_lock);
        }
        // Remove all related keys.
        await remover.exec();
        if(this.task_watcher){
            await this.task_watcher.cancel();
        }
        await container.cleanupContainer(rhis.box, this.box.state=="running");
        this.ev.emit("cleanup");
    }


};

module.exports=BoxInstance;