import mongoose from "mongoose";
const MONGODB_URI=process.env.MONGODB_URI!;


if(!MONGODB_URI){
    throw new Error("please provide mongo db url");
}

let cached=global.mongoose
if(!cached){
   cached=global.mongoose={
    conn:null,
    promise:null,
   }
}

export async function connectToDb(){
if(cached.conn){
    return cached.conn;
}
if(!cached.promise){
    mongoose.connect(MONGODB_URI)
    .then(()=>mongoose.connection)
}
try{
   cached.conn= await cached.promise;
}
catch(e){
    cached.promise=null;
    throw e;
}
return cached.conn;
}