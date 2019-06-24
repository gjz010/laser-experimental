const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const axios=require('axios');
module.exports=async (data)=>{
    const user=verifyBearer(data.headers.authorization);
    if(!user) return {"code": 401};
    const id=user.id;
    const ret=await db.query("select function_bundle.id as id \
                                from function_bundle inner join bundle_ownership \
                                on function_bundle.id=bundle_ownership.bundleid \
                                where bundle_ownership.userid=$1 and function_bundle.id=$2;", [id, data.params["bundle_id"]]);
    if(ret.rowCount==0){
        return {
            "code": 404
        }
    }
    // TODO: do the flush job.
    axios.post("http://10.152.183.96/flush_bundle/app-"+data.params["bundle_id"]);
    return {
        code: 204
    }
}
