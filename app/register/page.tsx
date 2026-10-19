"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Dumbbell, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"

export default function Register(){
  const router = useRouter()
  const { register } = useAuth()
  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [showPw,setShowPw] = useState(false)
  const [error,setError] = useState("")
  const [busy,setBusy] = useState(false)

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if(busy) return
    setError("")
    setBusy(true)
    try {
      await register(name.trim(), email.trim(), password)
      router.push("/onboarding")
    } catch(err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return <main className="mesh grid min-h-screen place-items-center px-5 py-10"><div className="w-full max-w-md"><Link href="/" className="mb-8 flex justify-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#008b8b] text-[#effffe]"><Dumbbell/></span><span className="display text-xl font-bold leading-4">FITNESS<br/><b className="text-[#008b8b]">SAARTHI</b></span></Link><Card className="p-7"><h1 className="display text-3xl font-bold">Join the movement</h1><p className="mt-1 text-sm text-[#8b9691]">Let&apos;s build your personalized plan.</p>
  <form onSubmit={submit} className="mt-7">
    {error && <p className="mb-4 rounded-xl border border-[#ff5da2]/30 bg-[#ff5da2]/10 px-4 py-3 text-xs font-bold text-[#ff8ab0]">{error}</p>}
    <div className="space-y-3">
      <label className="hover-lift flex items-center gap-3 rounded-xl border border-white/[.07] bg-black/20 px-4 py-3"><UserRound size={16} className="text-[#008b8b]"/><input value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-transparent text-sm" placeholder="Your full name" autoComplete="name"/></label>
      <label className="hover-lift flex items-center gap-3 rounded-xl border border-white/[.07] bg-black/20 px-4 py-3"><Mail size={16} className="text-[#008b8b]"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full bg-transparent text-sm" placeholder="Email address" autoComplete="email"/></label>
      <label className="hover-lift flex items-center gap-3 rounded-xl border border-white/[.07] bg-black/20 px-4 py-3"><LockKeyhole size={16} className="text-[#008b8b]"/><input value={password} onChange={e=>setPassword(e.target.value)} type={showPw?"text":"password"} required minLength={8} className="w-full bg-transparent text-sm" placeholder="Create password (min 8 characters)" autoComplete="new-password"/><button type="button" onClick={()=>setShowPw(!showPw)} className="text-[#8b9691] hover:text-white">{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button></label>
    </div>
    <Button type="submit" className="mt-6 w-full">{busy?"Creating account...":<>Create account <ArrowRight size={16}/></>}</Button>
  </form>
  <p className="mt-5 text-center text-xs text-[#8b9691]">Already a member? <Link href="/login" className="font-bold text-[#008b8b]">Log in</Link></p></Card></div></main>
}
