import mongoose, {model,models} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser{
    email:string;
    password:string;
    _id?:mongoose.Types.ObjectId;
    createdAt?:Date;
    updatedAt?:Date;
}

const userSchema=new mongoose.Schema<IUser>(
    {
email:{
    type: String,
    required: true,
    unique: true,
},
password:{
    type: String,
    required:true
}
},{timestamps:true})

userSchema.pre("save",async function(next){
    if((this.isModified("password")))
    {
      this.password = await bcrypt.hash(this.password,10);
      next()
    }
    else
     next()
})
//models?.User returns the model if already exists else create an User
const User=models?.User||mongoose.model<IUser>("User",userSchema)
export default User