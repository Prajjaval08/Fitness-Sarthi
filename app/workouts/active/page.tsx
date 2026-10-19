"use client"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Check, ChevronLeft, Flame, Forward, Pause, Play, RotateCcw, TimerReset, Volume2 } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useWorkoutStore } from "@/store/useWorkoutStore"
import { useAuth } from "@/lib/auth-context"
import { ApiEnvelope, ApiError, apiFetch } from "@/lib/api"

interface WorkoutExerciseDetail {
  id: string
  sets: number
  reps: number | null
  durationSec: number | null
  restSec: number
  order: number
  exercise: {
    id: string
    name: string
    nameHindi: string | null
    description: string | null
    muscleGroups: string[]
    equipment: string[]
  }
}
interface WorkoutDetail {
  id: string
  title: string
  description: string | null
  difficulty: string
  durationMins: number
  category: string
  thumbnailUrl: string | null
  exercises: WorkoutExerciseDetail[]
}
interface WorkoutSummary { id: string }

const FALLBACK_IMG = "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=1000&q=80"

function ActiveSession(){
  const params = useSearchParams()
  const workoutId = params.get("id")
  const { user } = useAuth()
  const { activeExercise, completedSets, nextSet, nextExercise, reset } = useWorkoutStore()

  const [workout,setWorkout] = useState<WorkoutDetail | null>(null)
  const [loadError,setLoadError] = useState("")
  const [running,setRunning] = useState(false)
  const [sec,setSec] = useState(0)
  const [finishing,setFinishing] = useState(false)
  const [summary,setSummary] = useState<{currentStreak:number; longestStreak:number; totalXP:number} | null>(null)

  useEffect(()=>{ reset() },[reset])

  useEffect(()=>{
    async function load(){
      try {
        let id = workoutId
        if(!id){
          const list = await apiFetch<ApiEnvelope<WorkoutSummary[]>>("/api/workouts")
          id = list.data[0]?.id
          if(!id){ setLoadError("No workouts are available yet."); return }
        }
        const detail = await apiFetch<ApiEnvelope<WorkoutDetail>>(`/api/workouts/${id}`)
        setWorkout(detail.data)
      } catch(err){
        setLoadError(err instanceof ApiError && err.status===404 ? "Workout not found." : "Could not load this workout.")
      }
    }
    load()
  },[workoutId])

  useEffect(()=>{ if(!running) return; const id=setInterval(()=>setSec(s=>s+1),1000); return ()=>clearInterval(id) },[running])

  function resetTimer(){ setRunning(false); setSec(0) }

  const exercises = workout?.exercises ?? []
  const current = exercises[activeExercise]
  const totalSets = current?.sets ?? 1
  const progress = exercises.length ? Math.min(100, Math.round(((activeExercise + completedSets/Math.max(1,totalSets)) / exercises.length) * 100)) : 0
  const time = `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`
  const name = user?.name?.trim() ?? ""

  function completeSet(){
    if(completedSets + 1 >= totalSets){
      if(activeExercise + 1 >= exercises.length){ finishWorkout(); return }
      nextExercise()
    } else {
      nextSet()
    }
  }

  function prevExercise(){
    if(activeExercise > 0) useWorkoutStore.setState({ activeExercise: activeExercise - 1, completedSets: 0 })
  }
  function skipExercise(){
    if(activeExercise + 1 < exercises.length) nextExercise()
    else finishWorkout()
  }

  async function finishWorkout(){
    if(!workout || finishing || summary) return
    setFinishing(true)
    const elapsedMins = Math.max(1, Math.round(sec/60))
    const durationMins = sec > 0 ? elapsedMins : workout.durationMins
    try {
      const res = await apiFetch<ApiEnvelope<{ streak: { currentStreak:number; longestStreak:number; totalXP:number } }>>(
        "/api/workout-logs",
        { method: "POST", body: { workoutId: workout.id, durationMins, caloriesBurned: durationMins * 8 } },
      )
      setSummary(res.data.streak)
      setRunning(false)
    } catch(err){
      setLoadError(err instanceof ApiError ? err.message : "Could not save this workout.")
    } finally {
      setFinishing(false)
    }
  }

  if(summary && workout) return <main className="theme-bg grid-bg grid min-h-screen place-items-center px-5"><Card className="w-full max-w-md p-8 text-center"><span className="pulse-glow mx-auto grid size-20 place-items-center rounded-full bg-[#008b8b] text-[#effffe]"><Flame size={36}/></span><h1 className="display mt-6 text-4xl font-bold uppercase">Workout complete</h1><p className="mt-2 text-sm text-[#8b9691]">{workout.title} • {Math.max(1,Math.round(sec/60))} min • ~{Math.max(1,Math.round(sec/60))*8} kcal</p><div className="mt-6 grid grid-cols-3 gap-3">{[[`${summary.currentStreak}`,"day streak"],[`${summary.longestStreak}`,"best streak"],[`${summary.totalXP.toLocaleString()}`,"total XP"]].map(([v,l])=><div key={l} className="inset rounded-xl p-4"><p className="display text-2xl font-bold text-[#008b8b]">{v}</p><p className="text-[10px] text-[#8b9691]">{l}</p></div>)}</div><Link href="/dashboard"><Button className="mt-7 w-full">Back to dashboard</Button></Link></Card></main>

  if(loadError) return <main className="theme-bg grid-bg grid min-h-screen place-items-center px-5"><Card className="p-8 text-center"><p className="text-sm text-[#8b9691]">{loadError}</p><Link href="/workouts"><Button className="mt-5">Browse workouts</Button></Link></Card></main>
  if(!workout) return <main className="theme-bg grid-bg grid min-h-screen place-items-center"><div className="pulse-glow grid size-16 place-items-center rounded-2xl bg-[#008b8b] text-[#effffe]"><Play fill="currentColor"/></div></main>

  return <main className="theme-bg grid-bg min-h-screen px-5 py-5">
    <header className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/workouts" className="hover-lift flex items-center gap-2 text-sm text-[#8b9691]"><ChevronLeft/> Exit workout</Link><div className="text-center"><p className="text-[10px] uppercase tracking-[.25em] text-[#008b8b]">{workout.title}</p><p className="display text-xl font-bold">EXERCISE {Math.min(activeExercise+1, exercises.length)} <span className="text-[#8b9691]">/ {exercises.length}</span></p></div><button className="hover-lift grid size-10 place-items-center rounded-xl border border-white/[.07]"><Volume2 size={17}/></button></header>
    <div className="mx-auto mt-4 h-1 max-w-6xl rounded bg-white/[.07]"><div className="h-full rounded bg-[#008b8b] transition-all" style={{width:`${progress}%`}}/></div>
    <div className="mx-auto mt-8 grid max-w-6xl items-center gap-7 lg:grid-cols-[1fr_.75fr]">
      <div>
        <Card className="overflow-hidden"><div className="relative h-[350px] bg-cover bg-center" style={{backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.65),transparent),url('${workout.thumbnailUrl ?? FALLBACK_IMG}')`}}><div className="absolute bottom-5 left-5 right-5"><p className="text-xs uppercase tracking-widest text-[#19d3c5]">{current?.exercise.muscleGroups.join(" • ") ?? workout.category}</p><h1 className="display text-5xl font-bold uppercase">{current?.exercise.name ?? workout.title}</h1>{current?.exercise.nameHindi && <p className="mt-1 text-sm text-[#8b9691]">{current.exercise.nameHindi}</p>}</div></div></Card>
        {current?.exercise.description && <p className="mt-4 text-sm leading-6 text-[#8b9691]">{current.exercise.description}</p>}
        <div className="mt-5 flex justify-center gap-3"><Button variant="soft" onClick={prevExercise}><RotateCcw size={15}/> Previous</Button><Button variant="soft" onClick={skipExercise}>Next exercise <Forward size={15}/></Button></div>
      </div>
      <div>
        <Card className="p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs text-[#8b9691]">Elapsed time</p><p className="display text-5xl font-bold">{time}</p><button onClick={resetTimer} className="hover-lift mt-2 flex items-center gap-1 text-xs font-bold text-[#008b8b]"><TimerReset size={14}/> Reset timer</button></div><button onClick={()=>setRunning(!running)} className="hover-lift grid size-14 place-items-center rounded-full bg-[#008b8b] text-[#effffe]">{running?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}</button></div>
          <div className="my-6 h-px bg-white/[.07]"/>
          <div className="flex items-center justify-between"><div><p className="text-xs text-[#8b9691]">Working set</p><h2 className="display text-3xl font-bold">SET {Math.min(completedSets+1,totalSets)} <span className="text-[#8b9691]">OF {totalSets}</span></h2></div><span className="text-xs text-[#008b8b]">Rest: {current?.restSec ?? 60} sec</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {current?.reps != null && <div className="inset rounded-xl p-4 text-center"><p className="text-[10px] tracking-widest text-[#8b9691]">REPS</p><p className="display mt-1 text-3xl font-bold">{current.reps}</p></div>}
            {current?.durationSec != null && <div className="inset rounded-xl p-4 text-center"><p className="text-[10px] tracking-widest text-[#8b9691]">DURATION</p><p className="display mt-1 text-3xl font-bold">{current.durationSec}s</p></div>}
            {current && current.exercise.equipment.length > 0 && <div className={`inset rounded-xl p-4 text-center ${current.reps == null && current.durationSec == null ? "col-span-2" : ""}`}><p className="text-[10px] tracking-widest text-[#8b9691]">EQUIPMENT</p><p className="display mt-1 text-xl font-bold">{current.exercise.equipment.join(", ")}</p></div>}
          </div>
          <Button onClick={completeSet} className="mt-5 w-full"><Check size={16}/> {activeExercise+1>=exercises.length && completedSets+1>=totalSets ? "Finish workout" : "Complete set"}</Button>
          <button onClick={finishWorkout} disabled={finishing} className="mt-3 w-full text-xs font-bold text-[#8b9691] hover:text-white">{finishing ? "Saving..." : "End workout early"}</button>
        </Card>
        <Card glass className="mt-4 flex items-center gap-3 p-4"><Flame className="text-[#ff8a5b]"/><div><p className="text-sm font-bold">{name?`Keep going, ${name}!`:"Keep going!"}</p><p className="text-xs text-[#8b9691]">Your form is looking strong today.</p></div></Card>
      </div>
    </div>
  </main>
}

export default function ActiveWorkout(){
  return <Suspense fallback={<main className="theme-bg grid-bg grid min-h-screen place-items-center"><div className="pulse-glow grid size-16 place-items-center rounded-2xl bg-[#008b8b] text-[#effffe]"><Play fill="currentColor"/></div></main>}><ActiveSession/></Suspense>
}
