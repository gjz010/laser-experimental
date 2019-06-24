const etcd=require('./etcd');
const uuid=require('uuid');
class TaskManager{
    constructor(){
        this.grabbed_containers=[];

    }
    async tryLockOneWithPrefix(prefix, str){
        console.log("locking "+prefix);
        while(1){
            // fetch 10 at a time.
            const fetch=Object.entries(await etcd.getAll().prefix(prefix).limit(10));
            //console.log(fetch);
            if(fetch.length==0) return null; // If fail to get any entry then fail.
            for (let k of fetch){ //iterate through free files.
                if(k[1]=='0'){
                    // cas operation
                    const cas=await etcd.if(k[0], "Value", "==", "0")
                    .then(etcd.put(k[0]).value(str))
                    .else(etcd.get(k[0]))
                    .commit();
                    console.log(cas)
                    if(cas.succeeded){
                        console.log("returning "+prefix);
                        return k[0];
                    }
                }
            }
        }
    }
    async initializeEmptyContainer(task_id, image_id){
        // TODO: get one from pre-grabbed.
        const empty_container_prefix="laser.free_containers.";
        const lock_profile=JSON.stringify({
            image_id, task_id
        });
        await this.tryLockOneWithPrefix(empty_container_prefix, lock_profile); // spin and spin.
        
    }

    async runTaskOnContainer(task_id, image_id){
        const ready_container_prefix="laser.loaded_functions."+image_id+".";
        let ready_one=await this.tryLockOneWithPrefix(ready_container_prefix, task_id);
        if(!ready_one){
            // spin up an empty container for the image.
            await this.initializeEmptyContainer(task_id, image_id);
        }else{
            // The task has been started.
            // Return worker id.
            return ready_one.replace(ready_container_prefix, "");
        }

    }
    async startTask(request, image_id){
        const task_id=uuid();
        const new_task={
            "request": request,
            "metadata": {
                "image_id": image_id,
                "task_id": task_id
            }
        };
        
        const task_key="laser.tasks."+task_id;
        await etcd.put(task_key).value(JSON.stringify(new_task));
        return task_id;
    }
    
    async getTask(task_id){
        const task_key="laser.tasks."+task_id;
        const task_val=await etcd.get(task_key).json();
        return task_val;
    }
    
    async waitForTask(task_id, timeout){
        const task_key="laser.tasks."+task_id;
        const watcher=await etcd.watch().key(task_key).create();
        const task_now=await this.getTask(task_id);
        if(task_now.response){
            watcher.cancel();
            return task_now;
        }else{
            let wait_timeout=new Promise(()=>{});
            if(timeout){
                wait_timeout=new Promise((resolve)=>{
                    setTimeout(async ()=>{
                        await watcher.cancel();
                        resolve();
                    }, timeout)
                });
            }
            const watch_data=new Promise((resolve)=>{
                watcher.on("put", async (kv)=>{
                    console.log(kv)
                    const task=JSON.parse(kv.value);
                    if(task.response){ 
                        await watcher.cancel();
                        resolve(task);
                    }
                    
                });
            });
            const result=await Promise.race([wait_timeout, watch_data]);
            return result;
        }
    }
}


module.exports=TaskManager;