"use client"
import { useCallback, useEffect, useState } from "react"
import AppShell from "@/components/app-shell"
import { Badge, Button, Card, SectionTitle } from "@/components/ui"
import { Check, Flame, Plus, Trophy, Users } from "lucide-react"
import { ApiEnvelope, ApiError, apiFetch } from "@/lib/api"

interface Challenge {
  id: string
  title: string
  description: string | null
  goal: string
  rewardXP: number
  startDate: string
  endDate: string
  participantCount: number
  joined: boolean
  progress: number
  completed: boolean
}
interface BoardRow {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  totalXP: number
  currentStreak: number
  level: number
  levelName: string
  isYou: boolean
}

function daysLeft(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000))
}

function initials(name: string): string {
  return name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase() || "?"
}

export default function Challenges(){
  const [challenges,setChallenges] = useState<Challenge[]>([])
  const [loading,setLoading] = useState(true)
  const [joining,setJoining] = useState<string | null>(null)
  const [board,setBoard] = useState<BoardRow[]>([])
  const [yourRank,setYourRank] = useState<number | null>(null)
  const [boardLoading,setBoardLoading] = useState(true)

  const load = useCallback(async ()=>{
    try {
      const r = await apiFetch<ApiEnvelope<Challenge[]>>("/api/challenges")
      setChallenges(r.data)
    } catch { setChallenges([]) } finally { setLoading(false) }
  },[])
  useEffect(()=>{ load() },[load])
  useEffect(()=>{
    apiFetch<{ success: boolean; data: BoardRow[]; yourRank: number | null }>("/api/leaderboard?limit=20")
      .then(r=>{ setBoard(r.data); setYourRank(r.yourRank) })
      .catch(()=>setBoard([]))
      .finally(()=>setBoardLoading(false))
  },[])

  async function join(id: string){
    if(joining) return
    setJoining(id)
    try {
      await apiFetch("/api/challenges", { method: "POST", body: { challengeId: id } })
      await load()
    } catch {} finally { setJoining(null) }
  }

  const featured = challenges.find(c=>!c.completed) ?? challenges[0]

  return <AppShell><div className="mx-auto max-w-[1300px]"><h1 className="display text-4xl font-bold">Community <span className="text-[#008b8b]">Challenges</span></h1><p className="mt-1 text-sm text-[#8b9691]">Show up together. Win together.</p>

  {loading ? <div className="mt-7 h-44 animate-pulse rounded-[22px] bg-white/[.04]"/>
  : featured ? <Card className="mt-7 overflow-hidden p-6"><div className="flex flex-wrap items-center gap-6"><span className="grid size-20 place-items-center rounded-full bg-[#f8c94c]/10 text-[#f8c94c]"><Trophy size={40}/></span><div className="flex-1"><Badge>{daysLeft(featured.endDate)} days left</Badge><h2 className="display mt-3 text-4xl font-bold uppercase">{featured.title}</h2><p className="mt-1 text-sm text-[#8b9691]">{featured.goal}</p><p className="mt-2 flex items-center gap-1 text-xs text-[#8b9691]"><Users size={13}/> {featured.participantCount} participants</p></div>{featured.joined ? <Badge><span className="flex items-center gap-1"><Check size={12}/> Joined</span></Badge> : <Button onClick={()=>join(featured.id)}>{joining===featured.id ? "Joining..." : <>Join challenge <Plus size={16}/></>}</Button>}</div></Card>
  : null}

  <div className="mt-7 grid gap-5 md:grid-cols-3">
    {loading ? [0,1,2].map(i=><div key={i} className="h-64 animate-pulse rounded-[22px] bg-white/[.04]"/>)
    : challenges.length===0 ? <Card className="p-10 text-center md:col-span-3"><p className="text-sm text-[#8b9691]">No challenges are live right now. Check back soon.</p></Card>
    : challenges.map(c=><Card className="p-5" key={c.id}>
      <div className="flex justify-between"><span className="grid size-12 place-items-center rounded-xl bg-[#008b8b]/10 text-[#008b8b]">{c.completed ? <Check size={22}/> : <Flame size={22}/>}</span><Badge>{c.rewardXP} XP</Badge></div>
      <h3 className="mt-5 display text-2xl font-bold">{c.title}</h3>
      {c.description && <p className="mt-1 text-xs text-[#8b9691]">{c.description}</p>}
      <p className="mt-2 text-[11px] text-[#a5afab]">{c.goal}</p>
      {c.joined ? <><div className="mt-5 h-2 rounded bg-white/[.06]"><div className="h-full rounded bg-[#008b8b] transition-all" style={{width:`${Math.min(100,c.progress)}%`}}/></div><div className="mt-3 flex justify-between text-[11px]"><span className="text-[#8b9691]">{c.completed ? "Completed" : `${Math.min(100,Math.round(c.progress))}% complete`}</span><span className="flex items-center gap-1 text-[#8b9691]"><Users size={12}/> {c.participantCount}</span></div></>
      : <div className="mt-5 flex items-center justify-between"><span className="flex items-center gap-1 text-[11px] text-[#8b9691]"><Users size={12}/> {c.participantCount} joined</span><Button variant="soft" onClick={()=>join(c.id)}>{joining===c.id ? "Joining..." : "Join"}</Button></div>}
    </Card>)}
  </div>

  <section className="mt-10"><SectionTitle eyebrow="Top performers" title="Leaderboard" action={yourRank != null ? <Badge>Your rank: #{yourRank}</Badge> : undefined}/>
   <Card className="p-2 sm:p-4">
    {boardLoading ? <div className="space-y-2">{[0,1,2,3,4].map(i=><div key={i} className="h-16 animate-pulse rounded-xl bg-white/[.04]"/>)}</div>
    : board.length===0 ? <p className="p-8 text-center text-sm text-[#8b9691]">No rankings yet. Log a workout to climb the board.</p>
    : <div className="space-y-1.5">{board.map(b=><div key={b.userId} className={`flex items-center gap-3 rounded-xl p-3 transition ${b.isYou ? "border border-[#008b8b]/50 bg-[#008b8b]/[.07]" : "border border-transparent hover:bg-white/[.03]"}`}>
      <span className={`display w-8 shrink-0 text-center text-lg font-bold ${b.rank<=3 ? "text-[#f8c94c]" : "text-[#8b9691]"}`}>{b.rank}</span>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#008b8b] to-[#ff5da2] text-xs font-bold text-[#effffe]">{initials(b.name)}</span>
      <div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-sm font-bold">{b.name}{b.isYou && <Badge>YOU</Badge>}</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8b9691]">LVL {b.level} • {b.levelName}</p></div>
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#ff6b35]"><Flame size={14}/>{b.currentStreak}</span>
      <span className="shrink-0 text-xs font-bold text-[#f8c94c]">{b.totalXP.toLocaleString()} XP</span>
     </div>)}</div>}
   </Card>
  </section>
  </div></AppShell>
}
