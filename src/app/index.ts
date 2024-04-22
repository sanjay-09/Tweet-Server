import express from "express";
import bodyParser, { urlencoded } from "body-parser";
import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4";
import {User} from "./users";
import cors from "cors"
import { graphqlContext } from "../interfaces";
import JWTService from "../services/jwt";
import { Tweet } from "./tweet";


export async function initServer(){
    const app=express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    
    app.use(cors({
        origin:'http://localhost:3000'
    }));
    const JWTServiceObj=new JWTService();
    const graphqlServer=new ApolloServer<graphqlContext>({
        typeDefs:`
        ${User.types}
        ${Tweet.types}

        type Query{
             ${User.queries}
             ${Tweet.queries}

        }

        type Mutation{
            ${Tweet.mutations}
            ${User.mutations}
            
        }
        `,
    
        resolvers:{
            Query:{
                ...User.resolvers.queries,
                ...Tweet.resolvers.queries
               
            },
            Mutation:{
                ...Tweet.resolvers.mutations,
                ...User.resolvers.mutations
            },
            ...User.resolvers.extraResolvers,
            ...Tweet.resolvers.extraResolvers
           
            
        }
    });
    await graphqlServer.start();
    app.use("/graphql",expressMiddleware(graphqlServer,{
        context:async({req,res})=>{
            return{
                user:req.headers.authorization?JWTServiceObj.decodeToken( req.headers.authorization.split("Bearer ")[1]):undefined
            }
        }
    }));
    return app;
}