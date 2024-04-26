import axios from "axios";
import {prismaClient} from "../../clients/db";
import JWTService from "../../services/jwt";
import { graphqlContext } from "../../interfaces";
import { PrismaClient, User } from "@prisma/client";
import UserService from "../../services/user";
import { redisClient } from "../../clients/Redis";
import { json } from "body-parser";
const UserServiceObj=new UserService();
const queries={
    verifyGoogleToken:async(parent:any,{token}:{token:string
    })=>{
        console.log("query");
        const jwtToken=await UserServiceObj.verifyGoogleToken(token);
        console.log(jwtToken);
        return jwtToken;
   },
    getCurrentUser:async(parent:any,args:any,ctx:graphqlContext)=>{
        console.log("getCurrentUser");
        const id=ctx.user?.id;
        if(!id){
            return null;
        }
        const user=await UserServiceObj.getUserById(id);
        console.log(user);
        return user;
    },
    getUserById:async(parent:any,{id}:{id:string})=>{
        const user=await UserServiceObj.getUserById(id);
        return user;

    }
};
const extraResolvers={
    user:{
        tweets:(parent:User)=>{
            return prismaClient.tweet.findMany({
                where:{
                    author:{
                        id:parent.id
                    }
                }
            })
        },
        follower:async(parent:User)=>{
            let result=await prismaClient.follows.findMany({
                where:{
                    following:{
                        id:parent.id
                    }
                },
                include:{
                    follower:true,
                   
                }
            })
            
            return result.map((item)=>{return item.follower});
            
        },
        following:async(parent:User)=>{
            let result=await prismaClient.follows.findMany({
                where:{
                    follower:{
                        id:parent.id
                    }
                },
                include:{
                    follower:true,
                    following:true
                }
            })
          
            return result.map((item)=>{return item.following});
        },
        recommendUser:async(parent:User,_:any,ctx:graphqlContext)=>{
            if(!ctx.user){
                return [];
            }
            const cachedValue=await redisClient.get(`RECOMMEND_USER_${ctx.user.id}`);
            if(cachedValue){
                console.log("cached");
                return JSON.parse(cachedValue);
            }
            const myfollowings=await prismaClient.follows.findMany({
                where:{
                   follower:{
                    id:ctx.user.id
                   }
                },
                include:{
                    following:{
                        include:{
                            follower:{
                                include:{
                                    following:true
                                }
                            }
                        }
                    }
                }
            

            })
            const user:User[]=[];
            for(const following of myfollowings){
                for(const followingOfFollowedUser of following.following.follower){
                    if(followingOfFollowedUser.following.id!==ctx.user.id &&myfollowings.findIndex((e)=>{
                        e?.followingId===followingOfFollowedUser.following.id
                    })<0){
                       user.push(followingOfFollowedUser.following);
                    }


                }
            }
            await redisClient.set(`RECOMMEND_USER_${ctx.user.id}`,JSON.stringify(user));
           
            return user;
        }
    }
    
}

const mutations={
    followUser:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
              if(!ctx.user){
                throw new Error("User is not authenticated");
              }
              await UserServiceObj.followUser(ctx.user.id,id);
              await redisClient.del(`RECOMMEND_USER_${ctx.user.id}`);
              return true;


    },
    unfollowUser:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
        if(!ctx.user){
            throw new Error("User is not authenticated");
        }
        await UserServiceObj.unfollowUser(ctx.user.id,id);
        await redisClient.del(`RECOMMEND_USER_${ctx.user.id}`);
        return true;
    }

}
export const resolvers={
    queries,
    extraResolvers,
    mutations
}