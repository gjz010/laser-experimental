const db=require('../lib/db');
const {sign}=require('../lib/jwt');
const uuid=require('uuid/v4');
const bcrypt=require('bcrypt');
module.exports=async (data)=>{
    const ret=await db.query("select id, username, pwd from laser_user where username=$1;", [data.body.name]);
    if(ret.rowCount==0) return {"code": 401};
    const user=ret.rows[0];
    const cmp=await bcrypt.compare(data.body.password, user.pwd);
    if(!cmp) return {"code": 401};
    return {
        "code": 200,
        "body":{
            "token": await sign({"id": user.id, "name": user.username})
        }
    }
                     
}
