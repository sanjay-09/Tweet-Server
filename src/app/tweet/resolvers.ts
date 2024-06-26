
import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { graphqlContext } from "../../interfaces"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import UserService from "../../services/user";
import tweetService from "../../services/tweet";
const tweetServiceObj=new tweetService();
const userServiceObj=new UserService();

const s3=new S3Client({
    region:process.env.AWS_DEFAULT_REGION
});
interface createTweetData{
    content:string,
    imageUrl?:string
}
const queries={
    getAllTweets:async()=>{
        
        return await tweetServiceObj.getAllTweets();
    },
    getUrlForTweet:async(parent:any,{imageName,imageType}:{imageName:string,imageType:string},ctx:graphqlContext)=>{
        if(!ctx.user){
            throw new Error("User is not authenticated")
        }
        const allowedImagesTypes=[
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];
        if(!allowedImagesTypes.includes(imageType)){
            throw new Error("this image type is not supported");
        }
        const command=new PutObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET,
            Key:`uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`
        })
        const url=await getSignedUrl(s3,command);
        return url;
        
    }

}
 const mutations={
    createTweet:async(parent:any,{payload}:{payload:createTweetData},ctx:graphqlContext)=>{
        console.log("mutations",ctx.user);
        if(!ctx.user){
            throw new Error("You are not authenticated");
        }
        const tweet=await tweetServiceObj.createTweet({
            ...payload,
            userId:ctx.user.id

        })
        return tweet;
        

    },
    likeTweet:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
           if(!ctx?.user?.id){
               throw new Error("User is not authenticated");

           }
           await prismaClient.like.create({
            data:{
                Tweet:{
                    connect:{
                        id:id
                    }
                },
                author:{
                    connect:{
                        id:ctx?.user?.id
                    }
                }

            }
           });
           return true;

    },
    unlikeTweet:async(parent:any,{id}:{id:string},ctx:graphqlContext)=>{
        if(!ctx?.user?.id){
            throw new Error("User is not authenticated");
        }
        await prismaClient.like.delete({
            where:{
                tweetId_userId:{
                    tweetId:id,
                    userId:ctx?.user?.id || ""
                }
            }
        });
        return true;
    }

};
const extraResolvers={
    Tweet:{
        author:(parent:Tweet)=>{
            return userServiceObj.getUserById(parent.authorId);
        },
        likes:async(parent:Tweet)=>{
            const data=await prismaClient.like.findMany({
                where:{
                    Tweet:{
                        id:parent.id
                        
                    },
                    
                },
                include:{
                    author:true
                }
            });
          const result=data.map((d)=>{
            return d.author

          });
         return result;

        }
    }
}
export const resolvers={mutations,extraResolvers,queries};