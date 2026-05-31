"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Apple, Bell, Bot, ChevronDown, Dumbbell, Flame, Home, LayoutGrid, LogOut, Menu, Search, Settings, Trophy, UserRound } from "lucide-react"
import { useEffect, useState } from "react"

const nav = [
  ["/dashboard","Overview",LayoutGrid],["/workouts","Workouts",Dumbbell],["/diet","Nutrition",Apple],
  ["/progress","Progress",Activity],["/ai-coach","AI Coach",Bot],["/challenges","Challenges",Trophy],
]
export default function AppShell({ children }: { children:React.ReactNode }) {
  const path = usePathname(), [open,setOpen] = useState(false), [name,setName] = useState("")
  useEffect(()=>setName(localStorage.getItem("fitness-saarthi-user-name")?.trim() || ""),[])
  const initials = name ? name.split(" ").map(part=>part[0]).slice(0,2).join("").toUpperCase() : "YOU"
  return <div className="theme-bg min-h-screen">
    <aside className={`theme-panel fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col border-r border-white/[.05] px-4 py-5 md:flex`}>
      <Link href="/" className="mb-10 flex items-center gap-3 px-2"><span className="grid size-10 place-items-center rounded-xl bg-[#008b8b] text-[#effffe]"><Dumbbell size={21}/></span><span className="display text-xl font-bold leading-4">FITNESS<br/><b className="text-[#008b8b]">SAARTHI</b></span></Link>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#66706c]">Main menu</p>
      <nav className="space-y-1">{nav.map(([href,label,Icon]:any) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${path===href||path.startsWith(href+"/")?"bg-[#008b8b] text-[#effffe]":"text-[#8b9691] hover:bg-white/[.04] hover:text-white"}`}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="mt-auto"><div className="mb-4 rounded-2xl border border-[#008b8b]/15 bg-[#008b8b]/[.06] p-4"><Flame size={20} className="mb-2 text-[#ff6b35]"/><p className="display font-bold">7 Day Streak!</p><p className="mt-1 text-[11px] leading-4 text-[#8b9691]">You are on fire. Keep showing up.</p></div><button className="flex gap-3 px-3 py-3 text-sm font-semibold text-[#8b9691]"><LogOut size={17}/> Log out</button></div>
    </aside>
    <header className="theme-panel sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/[.05] px-5 backdrop-blur-xl md:ml-[238px] md:px-8">
      <button className="md:hidden" onClick={()=>setOpen(!open)}><Menu/></button><div className="hidden md:block"><p className="text-xs text-[#8b9691]">Sunday, 31 May</p><h1 className="display text-lg font-bold">{name ? <><span className="text-[#008b8b]">{name}</span>, good morning</> : "Good morning"}</h1></div>
      <div className="flex items-center gap-3"><label className="hidden items-center gap-2 rounded-xl border border-white/[.06] bg-white/[.035] px-3 py-2 lg:flex"><Search size={16} className="text-[#8b9691]"/><input className="w-40 bg-transparent text-xs" placeholder="Search anything..."/></label><button className="hover-lift relative grid size-10 place-items-center rounded-xl border border-white/[.06] bg-white/[.035]"><Bell size={17}/><i className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ff5da2]"/></button><div className="flex items-center gap-2"><div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#008b8b] to-[#ff5da2] text-xs font-bold text-[#effffe]">{initials}</div><ChevronDown className="text-[#8b9691]" size={15}/></div></div>
    </header>
    <main className="min-h-[calc(100vh-72px)] px-5 pb-24 pt-6 md:ml-[238px] md:px-8 md:pb-8">{children}</main>
    <nav className="theme-panel fixed bottom-0 z-40 grid h-16 w-full grid-cols-6 border-t border-white/[.06] backdrop-blur-xl md:hidden">{nav.map(([href,label,Icon]:any)=><Link href={href} key={href} className={`grid place-items-center text-[9px] ${path===href?"text-[#008b8b]":"text-[#77817d]"}`}><Icon size={18}/><span>{label==="Nutrition"?"Diet":label==="Challenges"?"XP":label}</span></Link>)}</nav>
  </div>
}
