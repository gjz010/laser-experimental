const Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'L4WXOJBJ5KI85BRTHB0D',
    secretKey: 'nxZR3e6P+RxMaVYv0h6krOTEsV005TlS+e0axV8+'
});

class ImagePool{
    constructor(){
        this.image_pool={};
    }
    async ensureImage(image_id){
        if(this.image_pool[image_id]){
            
        }else{
            this.image_pool[image_id]={
                "hook": minioClient.fGetObject("laser", image_id, "/apps/"+image_id),
                "counter": 0
            };
        }
        await this.image_pool[image_id].hook;
    }
};
module.exports=ImagePool;