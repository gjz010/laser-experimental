const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
module.exports=async (data)=>{
    const user=verifyBearer(data.headers.authorization);
    if(!user) return {"code": 401};
    const id=user.id;
    const ret=await db.query("select api.id as id, \
                                api.api_name as name,\
                                api.api_spec as spec \
                                from api inner join api_ownership \
                                on api.id=api_ownership.apiid \
                                where api_ownership.userid=$1 and api.id=$2;", [id, data.params["api_id"]]);
    if(ret.rowCount){
        return {
            code: 200,
            body: ret.rows[0]
        }
    }else{
        return {
            code: 404
        }
    }
                            
}
