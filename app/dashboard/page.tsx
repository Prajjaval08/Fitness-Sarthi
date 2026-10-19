"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/app-shell"
import Link from "next/link"
import { WeeklyBars } from "@/components/charts"
import { Badge, Button, Card, ProgressRing, SectionTitle } from "@/components/ui"
import { ArrowUpRight, Bot, Clock3, Dumbbell, Flame, Play, Sparkles, Trophy, X, Zap } from "lucide-react"
import { ApiEnvelope, ApiError, apiFetch } from "@/lib/api"

interface DayActivity { date: string; label: string; workouts: number; caloriesBurned: number; minutes: number }
interface StreakInfo { current: number; longest: number; totalXP: number; level: number; levelName: string; xpForNext: number; xpProgress: number }
interface SuggestedWorkout { id: string; title: string; description: string | null; category: string; difficulty: string; durationMins: number; thumbnailUrl: string | null; exerciseCount: number }
interface ActiveChallenge { id: string; title: string; description: string | null; goal: string; progress: number; endDate: string }
interface DashboardData {
  user: { name: string | null; goal: string | null }
  streak: StreakInfo
  today: { nutrition: { calories: number; proteinG: number; carbsG: number; fatG: number }; caloriesBurned: number; workoutsCompleted: number }
  weeklyActivity: DayActivity[]
  activeChallenge: ActiveChallenge | null
  suggestedWorkout: SuggestedWorkout | null
}

const CAL_TARGET = 2000, PROTEIN_TARGET = 120, CARBS_TARGET = 250, FAT_TARGET = 65

function daysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export default function Dashboard(){
  const router = useRouter()
  const [dash,setDash] = useState<DashboardData | null>(null)
  const [error,setError] = useState("")
  const [planOpen,setPlanOpen] = useState(false)
  const [planGoal,setPlanGoal] = useState("")
  const [planDuration,setPlanDuration] = useState(40)
  const [planEquipment,setPlanEquipment] = useState("bodyweight and dumbbells")
  const [planLoading,setPlanLoading] = useState(false)
  const [planError,setPlanError] = useState("")

  useEffect(()=>{
    apiFetch<ApiEnvelope<DashboardData>>("/api/dashboard")
      .then(r=>setDash(r.data))
      .catch(()=>setError("Could not load your dashboard. Pull to retry."))
  },[])

  async function generatePlan(){
    if(planLoading) return
    setPlanLoading(true)
    setPlanError("")
    try {
      const r = await apiFetch<ApiEnvelope<{ id: string }>>("/api/ai/workout-plan", {
        method: "POST",
        body: {
          ...(planGoal ? { goal: planGoal } : {}),
          durationMins: planDuration,
          equipment: planEquipment.trim(),
        },
      })
      setPlanOpen(false)
      router.push(`/workouts/active?id=${r.data.id}`)
    } catch(err){
      setPlanError(err instanceof ApiError ? err.message : "Could not generate a workout. Try again.")
    } finally {
      setPlanLoading(false)
    }
  }

  if(error) return <AppShell><div className="mx-auto max-w-[1500px]"><Card className="p-8 text-center"><p className="text-sm text-[#8b9691]">{error}</p></Card></div></AppShell>
  if(!dash) return <AppShell><div className="mx-auto grid max-w-[1500px] place-items-center py-32"><div className="pulse-glow grid size-16 place-items-center rounded-2xl bg-[#008b8b] text-[#effffe]"><Dumbbell/></div></div></AppShell>

  const { streak, today, weeklyActivity, activeChallenge, suggestedWorkout } = dash
  const calPct = Math.min(100, Math.round(today.nutrition.calories / CAL_TARGET * 100))
  const weekWorkouts = weeklyActivity.reduce((s,d)=>s+d.workouts,0)
  const weekPct = Math.min(100, Math.round(weekWorkouts / 5 * 100))
  const macros: [string,string,number,string][] = [
    [`${Math.round(today.nutrition.proteinG)}g`,"Protein",Math.min(100,Math.round(today.nutrition.proteinG/PROTEIN_TARGET*100)),"#008b8b"],
    [`${Math.round(today.nutrition.carbsG)}g`,"Carbs",Math.min(100,Math.round(today.nutrition.carbsG/CARBS_TARGET*100)),"#ff6b35"],
    [`${Math.round(today.nutrition.fatG)}g`,"Fats",Math.min(100,Math.round(today.nutrition.fatG/FAT_TARGET*100)),"#f8c94c"],
  ]
  const todayStr = new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"})

  return <AppShell><div className="mx-auto max-w-[1500px]">
  <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[#8b9691] md:hidden">{todayStr}</p><h1 className="display text-3xl font-bold">Your Daily <span className="text-[#008b8b]">Momentum</span></h1><p className="mt-1 text-sm text-[#8b9691]">Stay consistent. Every rep takes you closer.</p></div><Button onClick={()=>{ setPlanError(""); setPlanOpen(true) }}><Zap size={16}/> Generate AI workout</Button></div>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   <Card className="flex items-center gap-4 p-5"><ProgressRing value={calPct} label={today.nutrition.calories.toLocaleString()} sublabel={`of ${CAL_TARGET.toLocaleString()} kcal`} size={90}/><div><p className="text-xs text-[#8b9691]">Calories today</p><p className="mt-1 text-sm font-bold text-[#008b8b]">{calPct}% complete</p></div></Card>
   <Card className="flex items-center gap-4 p-5"><span className="grid size-[74px] place-items-center rounded-full bg-[#ff6b35]/10"><Flame size={35} className="text-[#ff6b35]"/></span><div><p className="text-xs text-[#8b9691]">Workout streak</p><p className="display text-4xl font-bold">{streak.current} <span className="text-base text-[#8b9691]">days</span></p></div></Card>
   <Card className="p-5"><div className="flex justify-between text-xs text-[#8b9691]"><span>Weekly progress</span><ArrowUpRight size={15} className="text-[#008b8b]"/></div><p className="display mt-2 text-4xl font-bold">{weekPct}<span className="text-lg text-[#008b8b]">%</span></p><p className="mt-1 text-[11px] text-[#8b9691]">{weekWorkouts} of 5 weekly workouts</p><div className="mt-3 h-2 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[#008b8b]" style={{width:`${weekPct}%`}}/></div></Card>
   <Card className="p-5"><div className="flex justify-between text-xs text-[#8b9691]"><span>Your level</span><Trophy size={16} className="text-[#f8c94c]"/></div><p className="display mt-2 text-3xl font-bold uppercase">{streak.levelName} <span className="text-sm text-[#f8c94c]">LVL {streak.level}</span></p><p className="mt-3 text-[11px] text-[#8b9691]">{streak.xpProgress} / {streak.xpForNext} XP to next level</p></Card>
  </div>
  <div className="mt-7 grid gap-6 xl:grid-cols-[1.42fr_.9fr]">
   <div className="space-y-6">
    <section><SectionTitle eyebrow="Today's mission" title={suggestedWorkout ? suggestedWorkout.title : "No workout yet"}/>
     {suggestedWorkout ? <Card className="overflow-hidden"><div className="grid md:grid-cols-[.82fr_1fr]"><div className="relative min-h-56 bg-cover bg-center" style={{backgroundImage:`linear-gradient(90deg,rgba(0,0,0,.05),rgba(0,0,0,.55)),url('${suggestedWorkout.thumbnailUrl ?? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80"}')`}}><div className="absolute left-4 top-4"><Badge><span className="flex items-center gap-1"><Sparkles size={11}/> Saarthi pick</span></Badge></div></div><div className="p-6"><p className="text-xs uppercase tracking-wider text-[#8b9691]">{suggestedWorkout.category} • {suggestedWorkout.difficulty}</p><h3 className="mt-2 display text-3xl font-bold">{suggestedWorkout.description ?? "Build strength. Own the day."}</h3><div className="mt-5 flex gap-5 text-xs text-[#a5afab]"><span className="flex gap-2"><Clock3 size={15}/> {suggestedWorkout.durationMins} mins</span><span className="flex gap-2"><Dumbbell size={15}/> {suggestedWorkout.exerciseCount} exercises</span><span className="flex gap-2"><Zap size={15}/> ~{suggestedWorkout.durationMins * 8} kcal</span></div><Link href={`/workouts/active?id=${suggestedWorkout.id}`}><Button className="mt-7 w-full"><Play size={16} fill="currentColor"/> Start workout</Button></Link></div></div></Card>
     : <Card className="p-8 text-center"><p className="text-sm text-[#8b9691]">No workouts in the library yet.</p><Link href="/workouts"><Button className="mt-4">Browse workouts</Button></Link></Card>}
    </section>
    <Card className="p-5"><SectionTitle title="Weekly Activity" action={<span className="text-xs text-[#8b9691]">Last 7 days</span>}/><WeeklyBars data={weeklyActivity} dataKey="workouts"/></Card>
   </div>
   <div className="space-y-6"><Card className="p-5"><SectionTitle eyebrow="Nutrition" title="Daily Macros" action={<Link href="/diet" className="text-xs text-[#008b8b]">View diet</Link>}/><div className="flex justify-around">{macros.map(([v,l,p,c])=><ProgressRing key={l} value={p} label={v} sublabel={l} size={92} color={c}/>)}</div></Card>
   <Card className="p-5"><SectionTitle eyebrow="Community" title={activeChallenge ? "Active Challenge" : "Challenges"}/>
    {activeChallenge ? <div className="rounded-2xl border border-[#ff6b35]/20 bg-[#ff6b35]/[.06] p-4"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#ff6b35]/15 text-[#ff6b35]"><Trophy size={20}/></span><Badge orange>{daysLeft(activeChallenge.endDate)} days left</Badge></div><p className="mt-4 font-bold">{activeChallenge.title}</p><p className="mt-1 text-xs text-[#8b9691]">{activeChallenge.goal}</p><div className="mt-4 h-1.5 rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#ff6b35]" style={{width:`${Math.min(100,activeChallenge.progress)}%`}}/></div><p className="mt-2 text-[10px] text-[#8b9691]">{activeChallenge.progress}% complete</p></div>
    : <div className="text-center"><p className="text-sm text-[#8b9691]">No active challenge. Join one to push yourself.</p><Link href="/challenges"><Button className="mt-4">Browse challenges</Button></Link></div>}
   </Card>
   <Link href="/ai-coach"><Card glass className="flex items-center gap-4 p-5 hover:border-[#008b8b]/40"><span className="grid size-12 place-items-center rounded-2xl bg-[#008b8b] text-[#effffe]"><Bot/></span><div className="flex-1"><p className="font-bold">Ask your AI Coach</p><p className="text-xs text-[#8b9691]">Need a modification or meal tip?</p></div><ArrowUpRight size={18} className="text-[#008b8b]"/></Card></Link></div>
  </div>
 </div>
 {planOpen && <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-5 backdrop-blur-sm" onClick={()=>{ if(!planLoading) setPlanOpen(false) }}>
  <div className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
   <Card className="p-6">
    <div className="mb-5 flex items-start justify-between"><div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#008b8b]"><Sparkles size={12}/> AI Workout Studio</p><h2 className="display mt-2 text-2xl font-bold">Design my workout</h2><p className="mt-1 text-xs text-[#8b9691]">Saarthi builds a plan from your goal and gear.</p></div><button onClick={()=>{ if(!planLoading) setPlanOpen(false) }} className="text-[#8b9691] transition hover:text-white" aria-label="Close"><X size={18}/></button></div>
    {planError && <p className="mb-4 rounded-xl border border-[#ff5da2]/30 bg-[#ff5da2]/10 px-4 py-3 text-xs font-bold leading-5 text-[#ff8ab0]">{planError}</p>}
    <div className="space-y-4">
     <label><span className="mb-2 block text-xs text-[#8b9691]">Goal</span><select value={planGoal} onChange={e=>setPlanGoal(e.target.value)} disabled={planLoading} className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm font-bold">{[["","Recommended for me"],["Build Muscle","Build Muscle"],["Lose Weight","Lose Weight"],["Endurance","Endurance"],["Stay Active","Stay Active"]].map(([v,l])=><option key={l} value={v} className="bg-[#171919]">{l}</option>)}</select></label>
     <label><span className="mb-2 block text-xs text-[#8b9691]">Duration</span><select value={planDuration} onChange={e=>setPlanDuration(Number(e.target.value))} disabled={planLoading} className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm font-bold">{[20,30,40,50,60].map(m=><option key={m} value={m} className="bg-[#171919]">{m} minutes</option>)}</select></label>
     <label><span className="mb-2 block text-xs text-[#8b9691]">Equipment available</span><input value={planEquipment} onChange={e=>setPlanEquipment(e.target.value)} disabled={planLoading} className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="e.g. bodyweight and dumbbells"/></label>
    </div>
    <Button onClick={generatePlan} className="mt-6 w-full">{planLoading ? <><span className="pulse-glow grid size-5 place-items-center rounded-full bg-[#effffe]/20"><Sparkles size={13}/></span> Saarthi is designing your workout...</> : <><Zap size={16}/> Generate my workout</>}</Button>
   </Card>
  </div>
 </div>}
 </AppShell>
}
