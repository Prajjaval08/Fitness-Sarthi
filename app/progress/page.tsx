"use client"
import { useEffect, useState } from "react"
import AppShell from "@/components/app-shell"
import Link from "next/link"
import { WeeklyBars, WeightTrendChart } from "@/components/charts"
import { Button, Card, SectionTitle } from "@/components/ui"
import { Clock3, Dumbbell, Flame, TrendingUp } from "lucide-react"
import { ApiEnvelope, ApiError, apiFetch } from "@/lib/api"

interface DayActivity { date: string; label: string; workouts: number; caloriesBurned: number; minutes: number }
interface DashboardData {
  streak: { current: number; totalXP: number }
  weeklyActivity: DayActivity[]
}
interface WorkoutLog { id: string; durationMins: number; caloriesBurned: number | null; completedAt: string; workout: { id: string; title: string; category: string; thumbnailUrl: string | null } }
interface LogsResponse { data: WorkoutLog[]; pagination: { total: number } }
interface WeightEntry { id: string; weightKg: number; loggedAt: string }

const FALLBACK_IMG = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80"

export default function Progress(){
  const [dash,setDash] = useState<DashboardData | null>(null)
  const [logs,setLogs] = useState<WorkoutLog[]>([])
  const [totalLogs,setTotalLogs] = useState(0)
  const [loading,setLoading] = useState(true)
  const [weights,setWeights] = useState<WeightEntry[]>([])
  const [weightsLoading,setWeightsLoading] = useState(true)
  const [weightInput,setWeightInput] = useState("")
  const [weightSaving,setWeightSaving] = useState(false)
  const [weightError,setWeightError] = useState("")

  useEffect(()=>{
    Promise.all([
      apiFetch<ApiEnvelope<DashboardData>>("/api/dashboard").catch(()=>null),
      apiFetch<ApiEnvelope<WorkoutLog[]>>("/api/workout-logs?page=1&limit=50").catch(()=>null),
    ]).then(([d,l])=>{
      if(d){ setDash(d.data) }
      if(l){ setLogs(l.data); setTotalLogs(l.pagination?.total ?? l.data.length) }
      setLoading(false)
    })
    apiFetch<ApiEnvelope<WeightEntry[]>>("/api/weight-logs?days=90")
      .then(r=>setWeights(r.data))
      .catch(()=>setWeights([]))
      .finally(()=>setWeightsLoading(false))
  },[])

  async function logWeight(e: React.FormEvent){
    e.preventDefault()
    if(weightSaving) return
    setWeightError("")
    const v = Number(weightInput)
    if(weightInput.trim()==="" || !Number.isFinite(v) || v < 25 || v > 350){
      setWeightError("Enter a weight between 25 and 350 kg.")
      return
    }
    setWeightSaving(true)
    try {
      await apiFetch("/api/weight-logs", { method: "POST", body: { weightKg: v } })
      setWeightInput("")
      const r = await apiFetch<ApiEnvelope<WeightEntry[]>>("/api/weight-logs?days=90")
      setWeights(r.data)
    } catch(err){
      setWeightError(err instanceof ApiError ? err.message : "Could not log your weight.")
    } finally {
      setWeightSaving(false)
    }
  }

  const weightData = weights.map(w=>({ d: new Date(w.loggedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"}), v: w.weightKg }))
  const latestWeight = weights.length>0 ? weights[weights.length-1].weightKg : null

  const totalMinutes = logs.reduce((s,l)=>s+l.durationMins,0)
  const totalCalories = logs.reduce((s,l)=>s+Math.round(l.caloriesBurned ?? 0),0)
  const heat = dash ? dash.weeklyActivity.map(d=> d.workouts===0 ? 0 : d.workouts===1 ? 1 : d.workouts===2 ? 2 : 3) : []

  const stats: [string,string,string][] = [
    ["Workouts done", `${totalLogs}`, "all time"],
    ["Active minutes", `${totalMinutes.toLocaleString()}`, "all time"],
    ["Calories burned", `${totalCalories.toLocaleString()}`, "all time"],
    ["Day streak", `${dash?.streak.current ?? 0}`, "keep it alive"],
  ]
  const statIcons = [Dumbbell, Clock3, Flame, TrendingUp]

  return <AppShell><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="display text-4xl font-bold">Your <span className="text-[#008b8b]">Progress</span></h1><p className="mt-1 text-sm text-[#8b9691]">Small wins, tracked. Big transformation, loading.</p></div><Link href="/workouts"><Button><Dumbbell size={16}/> Start a workout</Button></Link></div>

  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([a,b,c],i)=>{ const Icon = statIcons[i]; return <Card className="p-5" key={a}><div className="flex justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#008b8b]/10 text-[#008b8b]"><Icon size={19}/></span><TrendingUp size={15} className="text-[#008b8b]"/></div><p className="mt-5 text-xs text-[#8b9691]">{a}</p><p className="display mt-1 text-3xl font-bold">{loading ? "—" : b}</p><p className="mt-1 text-[11px] text-[#008b8b]">{c}</p></Card>})}</div>

  <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
    <Card className="p-5"><SectionTitle eyebrow="Last 7 days" title="Training Minutes" action={<span className="text-xs text-[#8b9691]">{totalMinutes.toLocaleString()} min all time</span>}/>{dash ? <WeeklyBars data={dash.weeklyActivity} dataKey="minutes" color="#ff6b35" height={220}/> : <div className="h-[220px] animate-pulse rounded-xl bg-white/[.04]"/>}</Card>
    <Card className="p-5"><SectionTitle eyebrow="Consistency" title="Workout Heatmap"/><div className="grid grid-cols-7 gap-1.5">{heat.map((n,i)=><i key={i} className={`aspect-square rounded-[3px] ${n===0?"bg-white/[.04]":n===1?"bg-[#008b8b]/25":n===2?"bg-[#008b8b]/55":"bg-[#008b8b]"}`}/>)}</div><div className="mt-5 flex justify-between text-[10px] text-[#8b9691]"><span>7 days tracked</span><span>{dash ? dash.weeklyActivity.reduce((s,d)=>s+d.workouts,0) : 0} workouts this week</span></div></Card>
  </div>

  <section className="mt-7"><SectionTitle eyebrow="Body metrics" title="Weight Trend" action={latestWeight != null ? <span className="text-xs text-[#8b9691]">Latest: <b className="text-[#008b8b]">{latestWeight} kg</b></span> : undefined}/>
   <Card className="p-5">
    <form onSubmit={logWeight} className="mb-5 flex flex-wrap items-end gap-3">
     <label><span className="mb-2 block text-xs text-[#8b9691]">Today&apos;s weight (kg)</span><input value={weightInput} onChange={e=>setWeightInput(e.target.value)} inputMode="decimal" placeholder="78.5" className="w-40 rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm font-bold"/></label>
     <Button type="submit">{weightSaving ? "Logging..." : "Log weight"}</Button>
     {weightError && <p className="pb-3 text-xs font-bold text-[#ff8ab0]">{weightError}</p>}
    </form>
    {weightsLoading ? <div className="h-[250px] animate-pulse rounded-xl bg-white/[.04]"/>
    : weights.length===0 ? <div className="py-10 text-center"><p className="text-sm text-[#8b9691]">Log your first weigh-in to start seeing your trend.</p></div>
    : <WeightTrendChart data={weightData}/>}
   </Card>
  </section>

  <section className="mt-7"><SectionTitle eyebrow="History" title="Recent Workouts" action={<span className="text-xs text-[#8b9691]">{totalLogs} total</span>}/>
    {loading ? <div className="grid gap-4 sm:grid-cols-3">{[0,1,2].map(i=><div key={i} className="h-24 animate-pulse rounded-[22px] bg-white/[.04]"/>)}</div>
    : logs.length===0 ? <Card className="p-10 text-center"><p className="text-sm text-[#8b9691]">No workouts logged yet. Your history will build up here.</p><Link href="/workouts"><Button className="mt-4">Start your first workout</Button></Link></Card>
    : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{logs.map(l=><Card key={l.id} className="flex items-center gap-4 overflow-hidden p-4"><div className="size-16 shrink-0 rounded-xl bg-cover bg-center" style={{backgroundImage:`url(${l.workout.thumbnailUrl ?? FALLBACK_IMG})`}}/><div className="flex-1"><p className="text-sm font-bold">{l.workout.title}</p><p className="mt-1 text-[11px] text-[#8b9691]">{new Date(l.completedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} • {l.durationMins} min{l.caloriesBurned != null && ` • ${Math.round(l.caloriesBurned)} kcal`}</p></div><span className="text-[10px] font-bold uppercase tracking-widest text-[#008b8b]">{l.workout.category}</span></Card>)}</div>}
  </section>
  </div></AppShell>
}
