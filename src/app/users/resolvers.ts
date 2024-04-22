import axios from "axios";
import {prismaClient} from "../../clients/db";
import JWTService from "../../services/jwt";
import { graphqlContext } from "../../interfaces";
import { PrismaClient, User } from "@prisma/client";
import UserService from "../../services/user";
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
        console.log("user",user);
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
                    following:true
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
        }
    }
    
}

const mutations={
    followUser:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
              if(!ctx.user){
                throw new Error("User is not authenticated");
              }
              await UserServiceObj.followUser(ctx.user.id,id);
              return true;


    },
    unfollowUser:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
        if(!ctx.user){
            throw new Error("User is not authenticated");
        }
        await UserServiceObj.unfollowUser(ctx.user.id,id);
        return true;
    }

}
export const resolvers={
    queries,
    extraResolvers,
    mutations
}