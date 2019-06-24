const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const uuid=require('uuid/v4');
const Minio=require('minio');
const minio=require('../lib/minio');
module.exports=async (data)=>{
    const user=verifyBearer(data.headers.authorization);
    if(!user) return {"code": 401};
    const id=user.id;
    const bundle_id=uuid();
    await minio.copyObject("laser", bundle_id, "/laser/example-app", new Minio.CopyConditions());
    await db.query("insert into function_bundle (id, bundle_name, bundle_object) values ($1, $2, $3);", [bundle_id, data.body.name, bundle_id]);
    await db.query("insert into bundle_ownership (userid, bundleid) values ($1, $2);", [id, bundle_id]);
    return {
        code: 200,
        body: {
            "id": bundle_id,
            "name": data.body.name
        }
    }
}
