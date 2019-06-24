const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
module.exports=async (data)=>{
    const user=verifyBearer(data.headers.authorization);
    if(!user) return {"code": 401};
    const id=user.id;
    const ret=await db.query("select laser_user.id as id, \
                                laser_user.username as name \
                                from laser_user \
                                where laser_user.id=$1;", [id]);
    if(ret.rowCount==0){
        return {
            "code": 401
        }
    }else{
        return {"code": 200, "body": ret.rows[0]};
    }
                            
}
