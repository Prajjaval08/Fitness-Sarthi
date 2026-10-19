"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, Bike, Check, Dumbbell, Flame, HeartPulse, Home, Sparkles, Target } from "lucide-react"
import { Badge, Button, Card } from "@/components/ui"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ApiError, apiFetch } from "@/lib/api"

const goals = [
  [Flame,"Lose Weight","Burn fat, feel lighter","WEIGHT_LOSS"],
  [Dumbbell,"Build Muscle","Strength and definition","MUSCLE_GAIN"],
  [Bike,"Endurance","Go farther, feel fitter","ENDURANCE"],
  [HeartPulse,"Stay Active","Move well, live well","MAINTENANCE"],
] as const

const activities = ["Mostly sedentary","Lightly active","Active most days","Very active"]
const places = [[Home,"Home"],[Dumbbell,"Gym"],[Activity,"Outdoors"],[Target,"Minimal gear"]] as const

export default function Onboarding(){
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step,setStep] = useState(1)
  const [goal,setGoal] = useState<string | null>(null)
  const [age,setAge] = useState("28")
  const [height,setHeight] = useState("175")
  const [weight,setWeight] = useState("78")
  const [activityLevel,setActivityLevel] = useState("Active most days")
  const [place,setPlace] = useState<string | null>(null)
  const [saving,setSaving] = useState(false)
  const [error,setError] = useState("")

  useEffect(()=>{
    if(!loading && !user && typeof window !== "undefined") router.replace("/login")
  },[loading, user, router])

  function numOrUndefined(v: string): number | undefined {
    const n = Number(v)
    return v.trim() !== "" && Number.isFinite(n) ? n : undefined
  }

  async function finish(){
    if(saving) return
    setError("")
    setSaving(true)
    try {
      const goalEnum = goals.find(g=>g[1]===goal)?.[3]
      const ageNum = numOrUndefined(age)
      if(ageNum !== undefined && (ageNum < 10 || ageNum > 120)) throw new ApiError(400, "Age must be between 10 and 120")
      await apiFetch("/api/profile", { method: "PUT", body: {
        ...(goalEnum ? { fitnessGoal: goalEnum } : {}),
        ...(ageNum !== undefined ? { age: Math.round(ageNum) } : {}),
        ...(numOrUndefined(height) !== undefined ? { heightCm: numOrUndefined(height) } : {}),
        ...(numOrUndefined(weight) !== undefined ? { weightKg: numOrUndefined(weight) } : {}),
        activityLevel,
        ...(place ? { bio: `Trains at: ${place}` } : {}),
      }})
      router.push("/dashboard")
    } catch(err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const canContinue = step===1 ? !!goal : step===4 ? !!place : true

  if(loading || !user) return <main className="mesh grid min-h-screen place-items-center"><div className="pulse-glow grid size-16 place-items-center rounded-2xl bg-[#008b8b] text-[#effffe]"><Dumbbell/></div></main>

  return <main className="mesh min-h-screen px-5 py-8"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><Link href="/" className="flex gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#008b8b] text-[#effffe]"><Dumbbell size={19}/></span><span className="display text-lg font-bold">FITNESS <b className="text-[#008b8b]">SAARTHI</b></span></Link><p className="text-xs text-[#8b9691]">STEP {step} OF 5</p></div><div className="mt-7 h-1 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[#008b8b] transition-all" style={{width:`${step*20}%`}}/></div>
  <div className="mt-12 text-center"><Badge>Let&apos;s know you better</Badge><h1 className="display mt-4 text-4xl font-bold uppercase">{step===1?"What is your main goal?":step===2?"Tell us your numbers":step===3?"How active are you?":step===4?"Where do you train?":"Your plan is ready!"}</h1><p className="mt-2 text-sm text-[#8b9691]">{step===5?"Your AI-powered journey has been tailored to you.":"This helps Saarthi create a plan that fits your life."}</p></div>
  <Card className="mx-auto mt-9 max-w-2xl p-6">
    {error && <p className="mb-4 rounded-xl border border-[#ff5da2]/30 bg-[#ff5da2]/10 px-4 py-3 text-xs font-bold text-[#ff8ab0]">{error}</p>}
    {step===1&&<div className="grid gap-3 sm:grid-cols-2">{goals.map(([Icon,t,s]:any)=><button key={t} onClick={()=>setGoal(t)} className={`flex gap-4 rounded-2xl border p-4 text-left transition ${goal===t?"border-[#008b8b]/60 bg-[#008b8b]/[.07]":"border-white/[.07] bg-white/[.025] hover:border-[#008b8b]/50 hover:bg-[#008b8b]/[.05]"}`}><span className="grid size-11 place-items-center rounded-xl bg-[#008b8b]/10 text-[#008b8b]"><Icon/></span><span className="flex-1"><b>{t}</b><small className="mt-1 block text-[#8b9691]">{s}</small></span>{goal===t&&<Check size={18} className="text-[#008b8b]"/>}</button>)}</div>}
    {step===2&&<div className="grid gap-4 sm:grid-cols-3">{[["Age",age,setAge],["Height (cm)",height,setHeight],["Weight (kg)",weight,setWeight]].map(([label,val,setter]:any)=><label key={label}><span className="mb-2 block text-xs text-[#8b9691]">{label}</span><input value={val} onChange={e=>setter(e.target.value)} inputMode="decimal" className="w-full rounded-xl border border-white/[.07] bg-black/20 p-4 text-xl font-bold"/></label>)}</div>}
    {step===3&&<div className="space-y-3">{activities.map(x=><button key={x} onClick={()=>setActivityLevel(x)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-bold ${activityLevel===x?"border-[#008b8b]/50 bg-[#008b8b]/[.06]":"border-white/[.07]"}`}>{x}{activityLevel===x&&<Check className="text-[#008b8b]" size={17}/>}</button>)}</div>}
    {step===4&&<div className="grid grid-cols-2 gap-3">{places.map(([Icon,t]:any)=><button key={t} onClick={()=>setPlace(t)} className={`grid place-items-center gap-2 rounded-xl border p-5 text-sm font-bold ${place===t?"border-[#008b8b]/60 bg-[#008b8b]/[.07]":"border-white/[.07] hover:border-[#008b8b]/50"}`}><Icon className="text-[#008b8b]"/>{t}</button>)}</div>}
    {step===5&&<div className="text-center"><span className="pulse-glow mx-auto grid size-20 place-items-center rounded-full bg-[#008b8b] text-[#effffe]"><Sparkles size={34}/></span><h3 className="mt-6 display text-3xl font-bold">STRONG START PLAN</h3><p className="mt-2 text-sm text-[#8b9691]">{goal ?? "Your goal"} • {activityLevel} • {place ? `Trains at ${place.toLowerCase()}` : "Your space"}</p><Button onClick={finish} className="mt-7 w-full">{saving?"Saving your plan...":<>Enter your dashboard <ArrowRight size={17}/></>}</Button><button onClick={()=>router.push("/dashboard")} className="mt-3 text-xs text-[#8b9691] hover:text-white">Skip for now</button></div>}
    {step<5&&<Button onClick={()=>{ if(canContinue) setStep(step+1) }} className={`mt-7 w-full ${!canContinue?"opacity-40":""}`}>Continue <ArrowRight size={17}/></Button>}
    {step<5&&<button onClick={()=>router.push("/dashboard")} className="mt-3 w-full text-xs text-[#8b9691] hover:text-white">Skip for now</button>}
  </Card></div></main>
}
