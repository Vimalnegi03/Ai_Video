import { authOptions } from "@/lib/auth";
import { connectToDb } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export async function GET(){
    try {
      await connectToDb()
       const videos= await Video.find({}).sort({createdAt:-1}).lean()
       if(!videos||videos.length<1)
       {
        return NextResponse.json([],{status:400})
       }
        return NextResponse.json(videos)
       
    } catch (error) {
        return NextResponse.json({
            error:"failed to fetch videos"
        },{status:500})
    }
}

export async function POST(request:NextRequest,response:NextResponse){
    try {
        //to get user is authenticated or not
      const session= getServerSession(authOptions)
      if(!session)
        return NextResponse.json({
            error:"Unauthorized"
        },{status:401})

        await connectToDb()
        const body:IVideo=await request.json()
        if(!body.title||!body.description||!body.thumbnailUrl){
            return NextResponse.json({
                error:"Missing Required fields"
            },{status:400})
        }
        const videoData={
            ...body,
            controls : body?.controls ?? true,
            transformation:{
                height:1920,
                width:1080,
                quality:body.transformation?.quality??100,
            }

        }
        const newVideo=await Video.create(videoData)
        return NextResponse.json(newVideo)
    } catch (error) {
        return NextResponse.json({
            error:"failed to create video"
        },{status:500})
    }
}