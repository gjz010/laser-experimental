const db=require('../lib/db');
const {verifyBearer}=require('../lib/jwt');
const {get_interfaces, traverse}=require('../lib/openapi-compiler');
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
    if(!ret.rowCount){
        return {
            code: 404
        }
    }else{
        const api=ret.rows[0];
        //TODO: Compile the API.
        try{
            const spec=JSON.parse(data.body.spec);
            const {nodes}=get_interfaces(spec);
            const compiled_spec=nodes;
            const used_bundles=new Set();
            traverse(compiled_spec, (m)=>{
                if(m.bundle){
                    used_bundles.add(m.bundle);
                }
            });
            for(let b of used_bundles){
                const r=await db.query("select bundleid from bundle_ownership where bundleid=$1 and userid=$2;",[b, id]);
                if(r.rowCount==0){
                    return {"code":400, "body": {"reason": `missing bundle ${b}`}};
                }
            }
            await db.query("update api set api_spec=$1, compiled_api_spec=$3 where api.id=$2;", [data.body.spec, api.id, JSON.stringify(compiled_spec)]);
        }catch(err){
            console.log(err);
            return {"code": 400}
        }
       
        return {
            code: 200,
            body: {
                "id": ret.rows.id,
                "name": ret.rows.name,
                "spec": data.body.spec
            }
        }
    }
                            
}
