import { connectToDb } from "@/lib/db";
import User from "@/models/User";
import { error } from "console";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest,response:NextResponse)
{
    try {
        const {email,password}=await request.json()
        if(!email||!password)
            return NextResponse.json({error:"Email and password are required"},{status:400})
        await connectToDb()
        const existingUser = await User.findOne({email})
        if(existingUser)
            return NextResponse.json({error:"User already exist with this email"},{status:400})
        const user=await User.create({email,password})
        return NextResponse.json({message:"User created successfully"},{status:201})
    } catch (error) {
        return NextResponse.json({error:error},{status:400})
    }
}