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
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../clients/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const queries = {
    verifyGoogleToken: (parent_1, _a) => __awaiter(void 0, [parent_1, _a], void 0, function* (parent, { token }) {
        try {
            const googleToken = token;
            const response = yield axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
            const info = yield response.data;
            const user = yield db_1.prismaClient.user.findUnique({
                where: {
                    email: info.email
                }
            });
            if (!user) {
                yield db_1.prismaClient.user.create({
                    data: {
                        email: info.email,
                        firstName: info.given_name,
                        lastName: info.family_Name,
                        profileImageUrl: info.picture
                    }
                });
            }
            const userInDb = yield db_1.prismaClient.user.findUnique({
                where: {
                    email: info.email
                }
            });
            if (!userInDb) {
                throw new Error('user with email');
            }
            const jwtObj = new jwt_1.default();
            const userToken = yield jwtObj.generateToken(userInDb);
            return userToken;
        }
        catch (err) {
            console.log(err);
        }
    }),
    getCurrentUser: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const id = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!id) {
            return null;
        }
        const user = yield db_1.prismaClient.user.findUnique({
            where: {
                id: id
            }
        });
        return user;
    }),
    getUserById: (parent_2, _c) => __awaiter(void 0, [parent_2, _c], void 0, function* (parent, { id }) {
        console.log("id", id);
        const user = yield db_1.prismaClient.user.findUnique({
            where: {
                id
            }
        });
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
        }
    }
};
exports.resolvers = {
    queries,
    extraResolvers
};
