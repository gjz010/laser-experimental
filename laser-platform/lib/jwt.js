const jwt=require('jsonwebtoken');
const KEY="https://swagger.io/docs/specification/2-0/authentication/";
module.exports={
    "sign": (obj)=>{
        return jwt.sign({"data":obj}, KEY);
    },
    "verify": (token)=>{
        try{
            return jwt.verify(token, KEY).data;
        }catch(err){
            return null;
        }
    },
    "verifyBearer": (bearer)=>{
        if(!bearer) return null;
        try{
            return jwt.verify(bearer.substring(7), KEY).data;
        }catch(err){
            return null;
        }
    }
};