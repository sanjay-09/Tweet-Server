import { prismaClient } from "../clients/db";

export interface createTweetData{
    content:string,
    imageUrl?:string
    userId:string
}

class tweetService{
    async createTweet(data:createTweetData){
        const tweet=await prismaClient.tweet.create({
            data:{
                content:data.content,
                imageUrl:data.imageUrl,
                author:{
                    connect:{
                        id:data.userId
                    }
                }

            }
        })
        return tweet;
    }
    async getAllTweets(){
        return prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}});
    }



}
export default tweetService;