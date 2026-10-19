"use client"
import { useCallback, useEffect, useState } from "react"
import AppShell from "@/components/app-shell"
import { Button, Card, ProgressRing, SectionTitle } from "@/components/ui"
import { Apple, Coffee, Droplets, Plus, Soup, Trash2 } from "lucide-react"
import { ApiEnvelope, ApiError, apiFetch } from "@/lib/api"

interface Meal { id: string; mealType: string; foodName: string; calories: number; proteinG: number | null; carbsG: number | null; fatG: number | null; loggedAt: string }
interface Totals { calories: number; proteinG: number; carbsG: number; fatG: number }
interface MealsResponse { data: Meal[]; totals: Totals }
interface WaterEntry { id: string; amountMl: number; loggedAt: string }
interface WaterResponse { data: WaterEntry[]; totalMl: number; targetMl: number }

const MEAL_TYPES = ["BREAKFAST","LUNCH","DINNER","SNACK"] as const
const CAL_TARGET = 2000, PROTEIN_TARGET = 120, CARBS_TARGET = 250, FAT_TARGET = 65

const pretty = (t: string) => t.charAt(0) + t.slice(1).toLowerCase()
function mealIcon(mealType: string){
  switch(mealType){
    case "BREAKFAST": return Coffee
    case "LUNCH": return Soup
    case "SNACK": return Apple
    default: return Soup
  }
}
function toDateInput(d: Date){ return d.toISOString().slice(0,10) }

export default function Diet(){
  const [meals,setMeals] = useState<Meal[]>([])
  const [totals,setTotals] = useState<Totals>({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 })
  const [loading,setLoading] = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [mealType,setMealType] = useState<string>("BREAKFAST")
  const [foodName,setFoodName] = useState("")
  const [calories,setCalories] = useState("")
  const [proteinG,setProteinG] = useState("")
  const [carbsG,setCarbsG] = useState("")
  const [fatG,setFatG] = useState("")
  const [formError,setFormError] = useState("")
  const [saving,setSaving] = useState(false)
  const [waterEntries,setWaterEntries] = useState<WaterEntry[]>([])
  const [totalMl,setTotalMl] = useState(0)
  const [targetMl,setTargetMl] = useState(2500)
  const [waterSaving,setWaterSaving] = useState(false)
  const [waterError,setWaterError] = useState("")

  const load = useCallback(async (date: string)=>{
    setLoading(true)
    try {
      const r = await apiFetch<MealsResponse>(`/api/meal-logs?date=${date}`)
      setMeals(r.data)
      setTotals(r.totals)
    } catch { setMeals([]) } finally { setLoading(false) }
  },[])

  const loadWater = useCallback(async ()=>{
    try {
      const r = await apiFetch<WaterResponse>("/api/water-logs")
      setWaterEntries(r.data)
      setTotalMl(r.totalMl)
      setTargetMl(r.targetMl)
    } catch { /* hydration stays at zero on failure */ }
  },[])

  const today = toDateInput(new Date())
  useEffect(()=>{ load(today) },[load, today])
  useEffect(()=>{ loadWater() },[loadWater])

  async function addWater(amountMl: number){
    if(waterSaving) return
    setWaterSaving(true)
    setWaterError("")
    try {
      await apiFetch("/api/water-logs", { method: "POST", body: { amountMl } })
      await loadWater()
    } catch(err){
      setWaterError(err instanceof ApiError ? err.message : "Could not log water.")
    } finally { setWaterSaving(false) }
  }

  async function removeWater(id: string){
    try {
      await apiFetch(`/api/water-logs/${id}`, { method: "DELETE" })
      await loadWater()
    } catch { /* keep the entry on failure */ }
  }

  function num(v: string): number | undefined {
    const n = Number(v)
    return v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined
  }

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if(saving) return
    setFormError("")
    const cal = num(calories)
    if(!foodName.trim()){ setFormError("Tell us what you ate."); return }
    if(cal === undefined){ setFormError("Enter a valid calorie amount."); return }
    setSaving(true)
    try {
      await apiFetch("/api/meal-logs", { method: "POST", body: {
        mealType, foodName: foodName.trim(), calories: cal,
        ...(num(proteinG) !== undefined ? { proteinG: num(proteinG) } : {}),
        ...(num(carbsG) !== undefined ? { carbsG: num(carbsG) } : {}),
        ...(num(fatG) !== undefined ? { fatG: num(fatG) } : {}),
      }})
      setShowForm(false); setFoodName(""); setCalories(""); setProteinG(""); setCarbsG(""); setFatG("")
      await load(today)
    } catch(err){
      setFormError(err instanceof ApiError ? err.message : "Could not save this meal.")
    } finally { setSaving(false) }
  }

  async function remove(id: string){
    try {
      await apiFetch(`/api/meal-logs/${id}`, { method: "DELETE" })
      await load(today)
    } catch {}
  }

  const calPct = Math.min(100, Math.round(totals.calories / CAL_TARGET * 100))
  const macros: [string,string,number,string,number][] = [
    [`${Math.round(totals.proteinG)}g`,"Protein",Math.min(100,Math.round(totals.proteinG/PROTEIN_TARGET*100)),"#008b8b",PROTEIN_TARGET],
    [`${Math.round(totals.carbsG)}g`,"Carbs",Math.min(100,Math.round(totals.carbsG/CARBS_TARGET*100)),"#ff6b35",CARBS_TARGET],
    [`${Math.round(totals.fatG)}g`,"Fats",Math.min(100,Math.round(totals.fatG/FAT_TARGET*100)),"#f8c94c",FAT_TARGET],
  ]
  const proteinShort = Math.max(0, Math.round(PROTEIN_TARGET - totals.proteinG))
  const dateLabel = new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"short"})

  return <AppShell><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap justify-between gap-4"><div><h1 className="display text-4xl font-bold">Smart <span className="text-[#008b8b]">Nutrition</span></h1><p className="mt-1 text-sm text-[#8b9691]">Fuel your progress with food that works for your life.</p></div><Button onClick={()=>setShowForm(!showForm)}><Plus size={16}/> Log a meal</Button></div>

  {showForm && <Card className="mt-6 p-6"><form onSubmit={submit}>
    {formError && <p className="mb-4 rounded-xl border border-[#ff5da2]/30 bg-[#ff5da2]/10 px-4 py-3 text-xs font-bold text-[#ff8ab0]">{formError}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="lg:col-span-1"><span className="mb-2 block text-xs text-[#8b9691]">Meal</span><select value={mealType} onChange={e=>setMealType(e.target.value)} className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm font-bold">{MEAL_TYPES.map(t=><option key={t} value={t} className="bg-[#171919]">{pretty(t)}</option>)}</select></label>
      <label className="lg:col-span-2"><span className="mb-2 block text-xs text-[#8b9691]">What did you eat?</span><input value={foodName} onChange={e=>setFoodName(e.target.value)} className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="e.g. Dal tadka, jeera rice"/></label>
      <label><span className="mb-2 block text-xs text-[#8b9691]">Calories</span><input value={calories} onChange={e=>setCalories(e.target.value)} inputMode="decimal" className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="450"/></label>
      <label><span className="mb-2 block text-xs text-[#8b9691]">Protein (g)</span><input value={proteinG} onChange={e=>setProteinG(e.target.value)} inputMode="decimal" className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="25"/></label>
      <label><span className="mb-2 block text-xs text-[#8b9691]">Carbs (g)</span><input value={carbsG} onChange={e=>setCarbsG(e.target.value)} inputMode="decimal" className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="40"/></label>
      <label><span className="mb-2 block text-xs text-[#8b9691]">Fat (g)</span><input value={fatG} onChange={e=>setFatG(e.target.value)} inputMode="decimal" className="w-full rounded-xl border border-white/[.07] bg-black/20 p-3 text-sm" placeholder="12"/></label>
    </div>
    <div className="mt-5 flex gap-3"><Button type="submit">{saving?"Logging...":"Log meal"}</Button><Button variant="soft" onClick={()=>setShowForm(false)}>Cancel</Button></div>
  </form></Card>}

  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card className="flex items-center gap-3 p-5"><ProgressRing value={calPct} label={totals.calories.toLocaleString()} sublabel="kcal" size={90}/><div><p className="text-xs text-[#8b9691]">Daily calories</p><p className="mt-2 text-sm font-bold">{Math.max(0, CAL_TARGET - totals.calories).toLocaleString()} kcal left</p></div></Card>{macros.map(([v,l,p,c])=><Card className="flex items-center gap-4 p-5" key={l}><ProgressRing value={p} label={v} sublabel={l} size={82} color={c}/><p className="text-xs text-[#8b9691]">{Math.max(0,100-p)}%<br/>remaining</p></Card>)}</div>
  <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.8fr]"><Card className="p-5"><SectionTitle eyebrow={dateLabel} title="Today's Meals" action={<Button variant="ghost" onClick={()=>setShowForm(true)}><Plus size={15}/> Add</Button>}/>
    {loading ? <div className="space-y-3">{[0,1].map(i=><div key={i} className="h-16 animate-pulse rounded-xl bg-white/[.04]"/>)}</div>
    : meals.length===0 ? <div className="py-8 text-center"><p className="text-sm text-[#8b9691]">Nothing logged yet today. Your meals will show up here.</p><button onClick={()=>setShowForm(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[.12] py-4 text-xs text-[#8b9691] hover:text-white"><Plus size={15}/> Log your first meal</button></div>
    : <div className="space-y-3">{meals.map(m=>{ const Icon = mealIcon(m.mealType); return <div key={m.id} className="flex items-center gap-4 rounded-xl border border-white/[.06] bg-white/[.025] p-4"><span className="grid size-11 place-items-center rounded-xl bg-[#008b8b]/10 text-[#008b8b]"><Icon size={20}/></span><div className="flex-1"><p className="text-sm font-bold">{pretty(m.mealType)} <span className="ml-1 text-[10px] font-normal text-[#8b9691]">{new Date(m.loggedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span></p><p className="mt-1 text-xs text-[#8b9691]">{m.foodName}{m.proteinG != null && ` • ${Math.round(m.proteinG)}g protein`}</p></div><p className="text-xs font-bold text-[#008b8b]">{m.calories} kcal</p><button onClick={()=>remove(m.id)} className="text-[#8b9691] hover:text-[#ff5da2]"><Trash2 size={15}/></button></div>})}</div>}
  </Card>
  <div className="space-y-6"><Card className="p-5"><SectionTitle title="Hydration" action={<span className="text-xs text-[#8b9691]">{waterEntries.length} {waterEntries.length===1?"entry":"entries"} today</span>}/><div className="flex items-center gap-4"><Droplets className="text-[#42a5f5]" size={36}/><div><p className="display text-3xl font-bold">{(totalMl/1000).toFixed(2).replace(/\.?0+$/,"") || "0"} <span className="text-sm text-[#8b9691]">/ {(targetMl/1000).toFixed(1)} L</span></p><div className="mt-2 h-2 w-48 rounded bg-white/[.07]"><div className="h-full rounded bg-[#42a5f5] transition-all" style={{width:`${Math.min(100, totalMl/targetMl*100)}%`}}/></div></div></div><div className="mt-5 grid grid-cols-2 gap-2"><Button variant="soft" onClick={()=>addWater(250)}><Plus size={15}/> {waterSaving ? "..." : "250 ml glass"}</Button><Button variant="soft" onClick={()=>addWater(500)}><Plus size={15}/> {waterSaving ? "..." : "500 ml bottle"}</Button></div>
  {waterEntries.length>0 && <div className="no-scrollbar mt-4 max-h-36 space-y-1.5 overflow-y-auto">{waterEntries.map(e=><div key={e.id} className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2 text-xs"><span className="text-[#8b9691]">{new Date(e.loggedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span><span className="font-bold text-[#42a5f5]">{e.amountMl} ml</span><button onClick={()=>removeWater(e.id)} className="text-[#8b9691] transition hover:text-[#ff5da2]" aria-label="Delete entry"><Trash2 size={13}/></button></div>)}</div>}
  {waterError && <p className="mt-3 text-[11px] font-bold text-[#ff8ab0]">{waterError}</p>}</Card><Card glass className="p-5"><h3 className="font-bold">Saarthi&apos;s suggestion</h3><p className="mt-2 text-xs leading-5 text-[#8b9691]">{proteinShort > 0 ? `Add paneer or tofu to your next meal. You're ${proteinShort}g short of today's protein goal.` : "Protein goal smashed for today. Keep this energy going tomorrow."}</p></Card></div></div></div></AppShell>
}
