const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const uuid=require('uuid/v4');
const bcrypt=require('bcrypt');
module.exports=async (data)=>{

    try{
        const id=uuid();
        const password_hash=await bcrypt.hash(data.body.password, 10);
        await db.query("insert into laser_user (id, username, pwd) values ($1, $2, $3);", [id, data.body.name, password_hash]);
        return {
            "code": 201,
            "body": {
                "id": id,
                "name": data.body.name
            }

        }
    }catch(err){
        console.log(err);
        return {"code": 409}
    }
                     
}
