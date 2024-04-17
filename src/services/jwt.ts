import JWT from "jsonwebtoken";
import {prismaClient} from "../clients/db/index"
import { User } from "@prisma/client";
import {JWTUser} from "../interfaces"
const JWT_SECRET="ANSDfdgz@1234"
class JWTService{
    async generateToken(user:User){
    
        const payload:JWTUser={
            id:user?.id,
            email:user?.email
        };
        const token=JWT.sign(payload,JWT_SECRET,{
            expiresIn:'1d'
        })
        return token;

    }
    decodeToken(token:string){
       try{
        return JWT.verify(token,JWT_SECRET) as JWTUser
        
       }
       catch(err){
        return null;
       }


    }

}
export default JWTService;