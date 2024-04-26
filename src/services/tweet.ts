import { redisClient } from "../clients/Redis";
import { prismaClient } from "../clients/db";

export interface createTweetData{
    content:string,
    imageUrl?:string
    userId:string
}

class tweetService{
    async createTweet(data:createTweetData){
        const cachedValue=await redisClient.get(`USER_TWEET_${data.userId}`);
        if(cachedValue){
            throw new Error("Please wait");

        }
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
        });
        await redisClient.del("ALL_TWEETS");
        await redisClient.setex(`USER_TWEET_${data.userId}`,10,1);
        return tweet;
    }
    async getAllTweets(){
        const cachedValue=await redisClient.get("ALL_TWEETS");
        if(cachedValue){
            console.log("cached tweet");
            return JSON.parse(cachedValue); 
        }
        
        const tweets= await prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}});
        await redisClient.set("ALL_TWEETS",JSON.stringify(tweets));
        return tweets;
    }



}
export default tweetService;