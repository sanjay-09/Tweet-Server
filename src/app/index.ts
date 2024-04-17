import express from "express";
import bodyParser from "body-parser";
import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from "@apollo/server/express4";
import {User} from "./users";
import cors from "cors"
import { graphqlContext } from "../interfaces";
import JWTService from "../services/jwt";


export async function initServer(){
    const app=express();
    app.use(bodyParser.json());
    app.use(cors());
    const JWTServiceObj=new JWTService();
    const graphqlServer=new ApolloServer<graphqlContext>({
        typeDefs:`
        ${User.types}

        type Query{
             ${User.queries}
        }
        `,
        resolvers:{
            Query:{
                ...User.resolvers.queries
            }
           
            
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