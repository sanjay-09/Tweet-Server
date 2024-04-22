import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTService from "./jwt";

class UserService{
    async  verifyGoogleToken(token:string){
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
                        lastName:info.family_name,
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
            
    
            return userToken;
           }
           catch(err){
               console.log(err);
           }
           

    }

    async getUserById(id:string){
        return await prismaClient.user.findUnique({
            where:{
                id:id
            }
        })
    }

     async followUser(from:string,to:string){
        return prismaClient.follows.create({
            data:{
                follower:{
                    connect:{
                        id:from
                    }
                },
                following:{
                    connect:{
                        id:to
                    }
                }
            }
        })
     }

     async unfollowUser(from:string,to:string){
        return prismaClient.follows.delete({
            where:{
                followerId_followingId: {
                    followerId: from,
                    followingId: to
                  }
            }
        })
     }
}
export default UserService;