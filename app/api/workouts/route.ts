import { NextResponse } from "next/server"
const workouts=[{id:"upper-body-power",title:"Upper Body Power",durationMins:45,category:"Strength",difficulty:"INTERMEDIATE"},{id:"morning-mobility",title:"Morning Mobility",durationMins:20,category:"Recovery",difficulty:"BEGINNER"}]
export async function GET(){return NextResponse.json({data:workouts})}
