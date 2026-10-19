"use client"
import { useEffect, useRef, useState } from "react"
import AppShell from "@/components/app-shell"
import { Badge, Button, Card } from "@/components/ui"
import { Bot, MessageSquare, Plus, Send, Sparkles } from "lucide-react"
import { ApiEnvelope, ApiError, TOKEN_KEY, apiFetch } from "@/lib/api"

interface ChatMessage { role: "user" | "bot"; text: string }
interface Conversation { id: string; title: string; updatedAt: string }

const WELCOME: ChatMessage = { role: "bot", text: "Namaste! Ready to make today count? I can help with your workout, meals, recovery, or just a little motivation. What do you need?" }

async function postChat(message: string, conversationId: string | null, onToken: (full: string)=>void): Promise<{ text: string; conversationId: string | null; demo: boolean }>{
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ message, ...(conversationId ? { conversationId } : {}) }),
  })
  if(res.status === 401 && typeof window !== "undefined"){
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem("fitness-saarthi-user-name")
    window.location.href = "/login"
  }
  if(!res.ok) throw new ApiError(res.status, "The coach is having trouble right now. Please try again.")

  const contentType = res.headers.get("content-type") ?? ""

  // JSON fallback (demo mode when no ANTHROPIC_API_KEY).
  if(contentType.includes("application/json")){
    const json = await res.json()
    return { text: json.message ?? "", conversationId: json.conversationId ?? null, demo: true }
  }

  // SSE stream: data: {"text":"..."} chunks, then data: {"done":true,"conversationId":"..."}
  const reader = res.body?.getReader()
  if(!reader) throw new ApiError(500, "The coach is having trouble right now. Please try again.")
  const decoder = new TextDecoder()
  let buffer = "", full = "", conversationOut: string | null = null
  for(;;){
    const { done, value } = await reader.read()
    if(done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split("\n\n")
    buffer = parts.pop() ?? ""
    for(const part of parts){
      const line = part.trim()
      if(!line.startsWith("data:")) continue
      try {
        const evt = JSON.parse(line.slice(5).trim()) as { text?: string; done?: boolean; conversationId?: string; error?: string }
        if(typeof evt.error === "string") throw new ApiError(500, evt.error)
        if(typeof evt.text === "string"){ full += evt.text; onToken(full) }
        if(evt.done === true) conversationOut = evt.conversationId ?? conversationOut
      } catch(err){
        if(err instanceof ApiError) throw err
      }
    }
  }
  return { text: full, conversationId: conversationOut, demo: false }
}

export default function Coach(){
  const [msgs,setMsgs] = useState<ChatMessage[]>([WELCOME])
  const [text,setText] = useState("")
  const [conversationId,setConversationId] = useState<string | null>(null)
  const [conversations,setConversations] = useState<Conversation[]>([])
  const [sending,setSending] = useState(false)
  const [demoMode,setDemoMode] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    apiFetch<ApiEnvelope<Conversation[]>>("/api/ai/chat")
      .then(r=>setConversations(r.data))
      .catch(()=>{})
  },[])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: "smooth" }) },[msgs])

  async function send(){
    const message = text.trim()
    if(!message || sending) return
    setText("")
    setSending(true)
    const botIndex = msgs.length + 1
    setMsgs(prev=>[...prev, { role: "user", text: message }, { role: "bot", text: "…" }])
    try {
      const result = await postChat(message, conversationId, (full)=>{
        setMsgs(prev=>prev.map((m,i)=> i===botIndex ? { ...m, text: full } : m))
      })
      if(result.demo) setDemoMode(true)
      setMsgs(prev=>prev.map((m,i)=> i===botIndex ? { ...m, text: result.text || "The coach had nothing to say. Try again." } : m))
      if(result.conversationId && result.conversationId !== conversationId){
        setConversationId(result.conversationId)
        setConversations(prev=>{
          if(prev.some(c=>c.id===result.conversationId)) return prev
          return [{ id: result.conversationId as string, title: message.length>40 ? `${message.slice(0,40)}…` : message, updatedAt: new Date().toISOString() }, ...prev]
        })
      }
    } catch(err){
      setMsgs(prev=>prev.map((m,i)=> i===botIndex ? { ...m, text: err instanceof ApiError ? err.message : "The coach is having trouble right now. Please try again." } : m))
    } finally {
      setSending(false)
    }
  }

  function newChat(){
    setConversationId(null)
    setMsgs([WELCOME])
  }
  function openConversation(id: string){
    setConversationId(id)
    setMsgs([{ role: "bot", text: "Continuing this conversation — your Saarthi remembers everything you discussed here." }])
  }

  return <AppShell><div className="mx-auto max-w-[1300px]"><div className="flex flex-wrap justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="display text-4xl font-bold">AI <span className="text-[#008b8b]">Coach</span></h1><Badge>{demoMode ? "Demo" : "Online"}</Badge></div><p className="mt-1 text-sm text-[#8b9691]">Your bilingual fitness companion, available anytime.</p></div></div><div className="mt-7 grid gap-5 lg:grid-cols-[240px_1fr]"><Card className="hidden h-[650px] p-4 lg:block"><Button className="w-full" onClick={newChat}><Plus size={16}/> New chat</Button><p className="mt-6 px-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#8b9691]">Recent chats</p><div className="mt-2 space-y-1">{conversations.length===0 ? <p className="px-2 text-xs text-[#8b9691]">No chats yet. Start one!</p> : conversations.map(c=><button key={c.id} onClick={()=>openConversation(c.id)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition ${conversationId===c.id?"bg-[#008b8b]/10 text-[#008b8b]":"text-[#8b9691] hover:bg-white/[.04]"}`}><MessageSquare size={14} className="shrink-0"/><span className="truncate">{c.title}</span></button>)}</div></Card><Card className="flex h-[650px] flex-col overflow-hidden"><div className="flex items-center gap-3 border-b border-white/[.06] p-4"><span className="grid size-10 place-items-center rounded-xl bg-[#008b8b] text-[#effffe]"><Bot size={20}/></span><div><p className="text-sm font-bold">Saarthi AI</p><p className="text-[10px] text-[#008b8b]">● ACTIVE NOW</p></div>{demoMode && <span className="ml-auto flex items-center gap-1 text-[10px] text-[#8b9691]"><Sparkles size={12}/> Live replies need ANTHROPIC_API_KEY</span>}</div><div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-5">{msgs.map((m,i)=><div key={i} className={`flex gap-3 ${m.role==="user"?"justify-end":""}`}>{m.role==="bot"&&<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#008b8b]/10 text-[#008b8b]"><Bot size={16}/></span>}<div className={`max-w-[75%] whitespace-pre-line rounded-2xl p-4 text-sm leading-6 ${m.role==="user"?"bg-[#008b8b] text-[#effffe]":"bg-white/[.05] text-[#c4ceca]"}`}>{m.text}</div></div>)}<div ref={bottomRef}/></div><div className="px-5 pb-2"><div className="flex gap-2 overflow-x-auto pb-2">{["Diet plan banana hai","Progress dekho","Recovery tip do"].map(x=><button onClick={()=>setText(x)} key={x} className="whitespace-nowrap rounded-full border border-white/[.08] px-3 py-2 text-[11px] text-[#a5afab] hover:border-[#008b8b]/50">{x}</button>)}</div></div><div className="flex gap-3 border-t border-white/[.06] p-4"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={sending} className="flex-1 rounded-xl border border-white/[.07] bg-black/20 px-4 text-sm" placeholder="Ask Saarthi anything..."/><button onClick={send} disabled={sending} className="grid size-11 place-items-center rounded-xl bg-[#008b8b] text-[#effffe] disabled:opacity-50"><Send size={17}/></button></div></Card></div></div></AppShell>}
