const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const uuid=require('uuid/v4');
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
        await db.query("delete from function_bundle where id=$1;", [data.params["bundle_id"]]);
        await minio.removeObject("laser", ret.rows[0].object);
        // TODO: do the flush job
        return {
            "code": 204
        };
    }else{
        return {
            code: 404
        }
    }
}
