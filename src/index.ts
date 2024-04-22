import { initServer } from "./app";
import * as dotenv from "dotenv"
dotenv.config();


async function startServer(){
    const app=await initServer();
    app.listen(8000,()=>{
        console.log(`listening on the port 8000`);
    })
}
startServer();