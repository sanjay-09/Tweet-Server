"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Redis_1 = require("../clients/Redis");
const db_1 = require("../clients/db");
class tweetService {
    createTweet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedValue = yield Redis_1.redisClient.get(`USER_TWEET_${data.userId}`);
            if (cachedValue) {
                throw new Error("Please wait");
            }
            const tweet = yield db_1.prismaClient.tweet.create({
                data: {
                    content: data.content,
                    imageUrl: data.imageUrl,
                    author: {
                        connect: {
                            id: data.userId
                        }
                    }
                }
            });
            yield Redis_1.redisClient.del("ALL_TWEETS");
            yield Redis_1.redisClient.setex(`USER_TWEET_${data.userId}`, 10, 1);
            return tweet;
        });
    }
    getAllTweets() {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedValue = yield Redis_1.redisClient.get("ALL_TWEETS");
            if (cachedValue) {
                console.log("cached tweet");
                return JSON.parse(cachedValue);
            }
            const tweets = yield db_1.prismaClient.tweet.findMany({ orderBy: { createdAt: 'desc' } });
            yield Redis_1.redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
            return tweets;
        });
    }
}
exports.default = tweetService;
