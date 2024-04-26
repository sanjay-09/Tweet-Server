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
const db_1 = require("../../clients/db");
const user_1 = __importDefault(require("../../services/user"));
const Redis_1 = require("../../clients/Redis");
const UserServiceObj = new user_1.default();
const queries = {
    verifyGoogleToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        console.log("query");
        const jwtToken = yield UserServiceObj.verifyGoogleToken(token);
        console.log(jwtToken);
        return jwtToken;
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        console.log("getCurrentUser");
        const id = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!id) {
            return null;
        }
        const user = yield UserServiceObj.getUserById(id);
        console.log(user);
        return user;
    }),
    getUserById: (parent_2, _c) => __awaiter(void 0, [parent_2, _c], void 0, function* (parent, { id }) {
        const user = yield UserServiceObj.getUserById(id);
        return user;
    })
};
const extraResolvers = {
    user: {
        tweets: (parent) => {
            return db_1.prismaClient.tweet.findMany({
                where: {
                    author: {
                        id: parent.id
                    }
                }
            });
        },
        follower: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            let result = yield db_1.prismaClient.follows.findMany({
                where: {
                    following: {
                        id: parent.id
                    }
                },
                include: {
                    follower: true,
                }
            });
            return result.map((item) => { return item.follower; });
        }),
        following: (parent) => __awaiter(void 0, void 0, void 0, function* () {
            let result = yield db_1.prismaClient.follows.findMany({
                where: {
                    follower: {
                        id: parent.id
                    }
                },
                include: {
                    follower: true,
                    following: true
                }
            });
            return result.map((item) => { return item.following; });
        }),
        recommendUser: (parent, _, ctx) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ctx.user) {
                return [];
            }
            const cachedValue = yield Redis_1.redisClient.get(`RECOMMEND_USER_${ctx.user.id}`);
            if (cachedValue) {
                console.log("cached");
                return JSON.parse(cachedValue);
            }
            const myfollowings = yield db_1.prismaClient.follows.findMany({
                where: {
                    follower: {
                        id: ctx.user.id
                    }
                },
                include: {
                    following: {
                        include: {
                            follower: {
                                include: {
                                    following: true
                                }
                            }
                        }
                    }
                }
            });
            const user = [];
            for (const following of myfollowings) {
                for (const followingOfFollowedUser of following.following.follower) {
                    if (followingOfFollowedUser.following.id !== ctx.user.id && myfollowings.findIndex((e) => {
                        (e === null || e === void 0 ? void 0 : e.followingId) === followingOfFollowedUser.following.id;
                    }) < 0) {
                        user.push(followingOfFollowedUser.following);
                    }
                }
            }
            yield Redis_1.redisClient.set(`RECOMMEND_USER_${ctx.user.id}`, JSON.stringify(user));
            return user;
        })
    }
};
const mutations = {
    followUser: (parent_3, _d, ctx_1) => __awaiter(void 0, [parent_3, _d, ctx_1], void 0, function* (parent, { id }, ctx) {
        if (!ctx.user) {
            throw new Error("User is not authenticated");
        }
        yield UserServiceObj.followUser(ctx.user.id, id);
        yield Redis_1.redisClient.del(`RECOMMEND_USER_${ctx.user.id}`);
        return true;
    }),
    unfollowUser: (parent_4, _e, ctx_2) => __awaiter(void 0, [parent_4, _e, ctx_2], void 0, function* (parent, { id }, ctx) {
        if (!ctx.user) {
            throw new Error("User is not authenticated");
        }
        yield UserServiceObj.unfollowUser(ctx.user.id, id);
        yield Redis_1.redisClient.del(`RECOMMEND_USER_${ctx.user.id}`);
        return true;
    })
};
exports.resolvers = {
    queries,
    extraResolvers,
    mutations
};
