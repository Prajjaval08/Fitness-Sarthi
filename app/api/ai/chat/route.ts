import { NextResponse } from "next/server"
export async function POST(req:Request){const body=await req.json();if(!body?.message)return NextResponse.json({error:"message is required"},{status:400});return NextResponse.json({message:"Your Saarthi coach is ready. Add ANTHROPIC_API_KEY to enable live streaming responses.",demo:true})}
