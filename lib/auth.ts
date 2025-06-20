import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
export const authOptions:NextAuthOptions={
    providers: [
        GithubProvider({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
          name:"Credentials",
          credentials:{
            email:{label:"Email",type:"text"},
            password:{label:"Password",type:"password"},
          },
          async authorize(credentials)
          {
            if(!credentials?.email||!credentials?.password){
              throw new Error("Email is missing or password")
            }
            try {
              await connectToDb()
             const user= await User.findOne({email:credentials.email})
             if(!user){
              throw new Error("User not found")
             }
           const isPasswordCorrect= await bcrypt.compare(user.password,credentials.password)
           if(!isPasswordCorrect){
            throw new Error("Incorrect Password")
           }
           return {
            id:user._id.toString(),
            email:user.email,
           }
            } catch (error) {
              console.error("Auth error"+error)
              throw error
            }
          }
        })
        // ...add more providers here
      ],
      callbacks:{
       async jwt({token,user}){
           if(user){
            token.id=user.id
           }
           return token
       },
       async session({session,token}){
        if(session.user){
         session.user.id=token.id as string
        }
        return session
    },
      },
      pages:{
        signIn:"/login",
        error:"/login"
      },
    session:{
      strategy:'jwt',
      maxAge:30*60*24*24
    },
    secret:process.env.NEXTAUTH_SECRET,
}