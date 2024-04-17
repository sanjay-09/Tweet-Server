import { initServer } from "./app";

async function startServer(){
    const app=await initServer();
    app.listen(8000,()=>{
        console.log(`listening on the port 8000`);
    })
}
startServer();