"use client"
import { useEffect, useMemo, useState } from "react"
import AppShell from "@/components/app-shell"
import { Badge, Button, Card, SectionTitle } from "@/components/ui"
import { Clock3, Dumbbell, Play, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { ApiEnvelope, apiFetch } from "@/lib/api"

interface WorkoutSummary {
  id: string
  title: string
  description: string | null
  difficulty: string
  durationMins: number
  category: string
  thumbnailUrl: string | null
  exerciseCount: number
}

const CATEGORIES = ["All","Strength","Cardio","Core","Recovery"]
const DIFFICULTIES = ["All","BEGINNER","INTERMEDIATE","ADVANCED"]
const FALLBACK_IMG = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"

const prettyDiff = (d: string) => d.charAt(0) + d.slice(1).toLowerCase()

export default function Workouts(){
  const [workouts,setWorkouts] = useState<WorkoutSummary[]>([])
  const [search,setSearch] = useState("")
  const [category,setCategory] = useState("All")
  const [difficulty,setDifficulty] = useState("All")
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    let cancelled = false
    setLoading(true)
    const q = new URLSearchParams()
    if(search.trim()) q.set("search", search.trim())
    if(category !== "All") q.set("category", category)
    if(difficulty !== "All") q.set("difficulty", difficulty)
    const timer = setTimeout(()=>{
      apiFetch<ApiEnvelope<WorkoutSummary[]>>(`/api/workouts?${q.toString()}`)
        .then(r=>{ if(!cancelled) setWorkouts(r.data) })
        .catch(()=>{ if(!cancelled) setWorkouts([]) })
        .finally(()=>{ if(!cancelled) setLoading(false) })
    }, 250)
    return ()=>{ cancelled = true; clearTimeout(timer) }
  },[search, category, difficulty])

  const empty = useMemo(()=>!loading && workouts.length===0, [loading, workouts])

  return <AppShell><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="display text-4xl font-bold">Workout <span className="text-[#008b8b]">Library</span></h1><p className="mt-1 text-sm text-[#8b9691]">Train your way. Every workout is built to move you forward.</p></div><Link href="/ai-coach"><Button><Sparkles size={16}/> Generate with AI</Button></Link></div>
  <div className="mt-7 flex flex-wrap gap-3">
    <label className="flex min-w-56 flex-1 items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.03] px-4"><Search size={17} className="text-[#8b9691]"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-transparent py-3 text-sm" placeholder="Search workouts..."/></label>
    {CATEGORIES.map(x=><button key={x} onClick={()=>setCategory(x)} className={`rounded-xl border px-4 text-xs font-bold transition ${category===x?"border-[#008b8b] bg-[#008b8b] text-[#effffe]":"border-white/[.07] text-[#8b9691] hover:text-white"}`}>{x}</button>)}
    <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="rounded-xl border border-white/[.07] bg-white/[.03] px-3 text-xs font-bold text-[#8b9691]">
      {DIFFICULTIES.map(d=><option key={d} value={d} className="bg-[#171919]">{d==="All"?"All levels":prettyDiff(d)}</option>)}
    </select>
  </div>
  <section className="mt-9"><SectionTitle eyebrow="Recommended for you" title="Find Your Next Challenge" action={<span className="text-xs text-[#8b9691]">{workouts.length} workouts</span>}/>
  {loading
    ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0,1,2].map(i=><div key={i} className="h-72 animate-pulse rounded-[22px] bg-white/[.04]"/>)}</div>
    : empty
    ? <Card className="p-10 text-center"><Dumbbell className="mx-auto text-[#8b9691]" size={32}/><p className="mt-3 text-sm text-[#8b9691]">No workouts match your filters. Try a different search.</p></Card>
    : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{workouts.map(w=><Card key={w.id} className="overflow-hidden"><div className="relative h-44 bg-cover bg-center" style={{backgroundImage:`linear-gradient(0deg,rgba(10,12,11,.8),transparent),url(${w.thumbnailUrl ?? FALLBACK_IMG})`}}><div className="absolute left-4 top-4"><Badge orange={w.difficulty==="ADVANCED"}>{prettyDiff(w.difficulty)}</Badge></div><Link href={`/workouts/active?id=${w.id}`} className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-[#008b8b] text-[#effffe]"><Play fill="currentColor" size={15}/></Link></div><div className="p-5"><h3 className="display text-2xl font-bold">{w.title}</h3><p className="mt-1 text-[11px] uppercase tracking-wider text-[#8b9691]">{w.category} • {w.exerciseCount} exercises</p>{w.description && <p className="mt-2 line-clamp-2 text-xs text-[#8b9691]">{w.description}</p>}<div className="mt-4 flex gap-4 text-xs text-[#a5afab]"><span className="flex gap-1"><Clock3 size={14}/>{w.durationMins} min</span><span className="flex gap-1"><Dumbbell size={14}/>{w.exerciseCount} exercises</span></div></div></Card>)}</div>}
  </section></div></AppShell>
}
