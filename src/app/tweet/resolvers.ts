
import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { graphqlContext } from "../../interfaces"
interface createTweetData{
    content:string,
    imageUrl?:string
}
const queries={
    getAllTweets:()=>{
        console.log("getAllTweets");
        return prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}});
    }
}
 const mutations={
    createTweet:async(parent:any,{payload}:{payload:createTweetData},ctx:graphqlContext)=>{
        console.log("mutations",ctx.user);
        if(!ctx.user){
            throw new Error("You are not authenticated");
        }
        const tweet=await prismaClient.tweet.create({
            data:{
                content:payload.content,
                imageUrl:payload?.imageUrl,
                author:{
                    connect:{
                        id:ctx?.user?.['id']
                    }
                },


            }
        })
        return tweet;
        

    }

};
const extraResolvers={
    Tweet:{
        author:(parent:Tweet)=>{
            return prismaClient.user.findUnique({
                where:{
                    id:parent.authorId
                }
            })
        }
    }
}
export const resolvers={mutations,extraResolvers,queries};