const {Etcd3}=require('etcd3');
const bluebird=require('bluebird');
const etcd=new Etcd3();
bluebird.promisifyAll(etcd);
const container=require('./container');
const ImagePool=require('./image_pool');
const BoxInstance=require('./boxinstance');
//bluebird.promisifyAll(minioClient);
const uuid=require('uuid/v4');
const runner_id=uuid();

async function main(){
    console.log(runner_id);
    const images=new ImagePool();
    for(let i=0;i<1;i++){
        console.log("starting container "+i);
        const new_box=new BoxInstance(images);
        await new_box.spinup();
    }
    console.log("Runner started!");
}

main().catch(console.log)

