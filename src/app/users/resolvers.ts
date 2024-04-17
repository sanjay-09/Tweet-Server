import axios from "axios";
import {prismaClient} from "../../clients/db";
import JWTService from "../../services/jwt";
import { graphqlContext } from "../../interfaces";
const queries={
    verifyGoogleToken:async(parent:any,{token}:{token:string
    })=>{
       try{
        const googleToken=token;
        const response=await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        const info=await response.data;
         const user=await prismaClient.user.findUnique({
            where:{
                email:info.email
            }
         })
         if(!user){
            await prismaClient.user.create({
                data:{
                    email:info.email,
                    firstName:info.given_name,
                    lastName:info.family_Name,
                    profileImageUrl:info.picture
                      

                }
            })

         }
         const userInDb=await prismaClient.user.findUnique({
            where:{
                email:info.email
            }
         })
         if(!userInDb){
            throw new Error('user with email')
         }
         const jwtObj=new JWTService();
         const userToken=await jwtObj.generateToken(userInDb);
         console.log(userToken);

        return userToken;
       }
       catch(err){
        console.log(err);
       }
       
       

    },
    getCurrentUser:async(parent:any,args:any,ctx:graphqlContext)=>{
        console.log(ctx);
        const id=ctx.user?.id;
        if(!id){
            console.log("nukkk");
            return null;
        }
        const user=await prismaClient.user.findUnique({
            where:{
                id:id
            }
        })
        console.log(user);
        return user;
    }
};
export const resolvers={
    queries
}