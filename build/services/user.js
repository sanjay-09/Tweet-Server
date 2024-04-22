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
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../clients/db");
const jwt_1 = __importDefault(require("./jwt"));
class UserService {
    verifyGoogleToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
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
                            lastName: info.family_name,
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
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.prismaClient.user.findUnique({
                where: {
                    id: id
                }
            });
        });
    }
    followUser(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prismaClient.follows.create({
                data: {
                    follower: {
                        connect: {
                            id: from
                        }
                    },
                    following: {
                        connect: {
                            id: to
                        }
                    }
                }
            });
        });
    }
    unfollowUser(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prismaClient.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: from,
                        followingId: to
                    }
                }
            });
        });
    }
}
exports.default = UserService;
