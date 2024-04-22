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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const user_1 = __importDefault(require("../../services/user"));
const tweet_1 = __importDefault(require("../../services/tweet"));
const tweetServiceObj = new tweet_1.default();
const userServiceObj = new user_1.default();
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_DEFAULT_REGION
});
const queries = {
    getAllTweets: () => {
        return tweetServiceObj.getAllTweets();
    },
    getUrlForTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { imageName, imageType }, ctx) {
        if (!ctx.user) {
            throw new Error("User is not authenticated");
        }
        const allowedImagesTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];
        if (!allowedImagesTypes.includes(imageType)) {
            throw new Error("this image type is not supported");
        }
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`
        });
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command);
        return url;
    })
};
const mutations = {
    createTweet: (parent_2, _b, ctx_2) => __awaiter(void 0, [parent_2, _b, ctx_2], void 0, function* (parent, { payload }, ctx) {
        console.log("mutations", ctx.user);
        if (!ctx.user) {
            throw new Error("You are not authenticated");
        }
        const tweet = yield tweetServiceObj.createTweet(Object.assign(Object.assign({}, payload), { userId: ctx.user.id }));
        return tweet;
    })
};
const extraResolvers = {
    Tweet: {
        author: (parent) => {
            return userServiceObj.getUserById(parent.authorId);
        }
    }
};
exports.resolvers = { mutations, extraResolvers, queries };
