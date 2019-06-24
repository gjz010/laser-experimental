const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const Minio=require('minio');
const minio=require('../lib/minio');
module.exports=async (data)=>{
    const user=verifyBearer(data.headers.authorization);
    if(!user) return {"code": 401};
    const id=user.id;
    const ret=await db.query("select function_bundle.id as id, \
                                function_bundle.bundle_name as name, \
                                function_bundle.bundle_object as object \
                                from function_bundle inner join bundle_ownership \
                                on function_bundle.id=bundle_ownership.bundleid \
                                where bundle_ownership.userid=$1 and function_bundle.id = $2;", [id, data.params["bundle_id"]]);
    if(ret.rowCount){
        let object=ret.rows[0].object;
        const download_url=await minio.presignedUrl("GET", "laser", object, 60*15);
        return {
            code: 200,
            body: {"download_url": download_url.replace("http://10.0.0.17:30771", "https://minio.app.laser.gjz010.com")}
        }
    }else{
        return {
            code: 404
        }
    }

}
