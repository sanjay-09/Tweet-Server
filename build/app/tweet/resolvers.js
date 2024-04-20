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
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const queries = {
    getAllTweets: () => {
        console.log("getAllTweets");
        return db_1.prismaClient.tweet.findMany({ orderBy: { createdAt: 'desc' } });
    }
};
const mutations = {
    createTweet: (parent_1, _a, ctx_1) => __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function* (parent, { payload }, ctx) {
        var _b;
        console.log("mutations", ctx.user);
        if (!ctx.user) {
            throw new Error("You are not authenticated");
        }
        const tweet = yield db_1.prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageUrl: payload === null || payload === void 0 ? void 0 : payload.imageUrl,
                author: {
                    connect: {
                        id: (_b = ctx === null || ctx === void 0 ? void 0 : ctx.user) === null || _b === void 0 ? void 0 : _b['id']
                    }
                },
            }
        });
        return tweet;
    })
};
const extraResolvers = {
    Tweet: {
        author: (parent) => {
            return db_1.prismaClient.user.findUnique({
                where: {
                    id: parent.authorId
                }
            });
        }
    }
};
exports.resolvers = { mutations, extraResolvers, queries };
