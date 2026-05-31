import { ReactNode } from "react"

export function Card({ children, className = "", glass = false }: { children: ReactNode; className?: string; glass?: boolean }) {
  return <div className={`${glass ? "glass" : "neu"} rounded-[22px] ${className}`}>{children}</div>
}
export function Button({ children, className = "", variant = "primary", onClick, type = "button" }: { children: ReactNode; className?: string; variant?: "primary"|"soft"|"ghost"; onClick?: () => void; type?: "button"|"submit" }) {
  const styles = variant === "primary" ? "bg-[#008b8b] text-[#effffe] shadow-[0_10px_25px_rgba(0,139,139,.22)] hover:bg-[#19a7a3] hover:shadow-[0_14px_30px_rgba(0,139,139,.32)]" : variant === "soft" ? "neu" : "text-[#9ca7a2] hover:text-[#19d3c5]"
  return <button type={type} onClick={onClick} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition active:scale-[.96] ${styles} ${className}`}>{children}</button>
}
export function Badge({ children, orange = false }: { children: ReactNode; orange?: boolean }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.17em] ${orange ? "border-[#ff6b35]/30 bg-[#ff6b35]/10 text-[#ff8b60]" : "border-[#008b8b]/25 bg-[#008b8b]/10 text-[#008b8b]"}`}>{children}</span>
}
export function ProgressRing({ value, label, sublabel, size = 116, color = "#008b8b" }: { value: number; label: string; sublabel?: string; size?: number; color?: string }) {
  const r = 43, c = 2 * Math.PI * r
  return <div className="relative grid place-items-center" style={{ width:size, height:size }}>
    <svg className="-rotate-90" width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7"/><circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeLinecap="round" strokeWidth="7" strokeDashoffset={c*(1-value/100)} strokeDasharray={c}/></svg>
    <div className="absolute text-center"><p className="display text-2xl font-bold">{label}</p>{sublabel && <p className="text-[10px] text-[#8b9691]">{sublabel}</p>}</div>
  </div>
}
export function SectionTitle({ eyebrow, title, action }: { eyebrow?:string; title:string; action?:ReactNode }) {
  return <div className="mb-5 flex items-end justify-between"><div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.25em] text-[#008b8b]">{eyebrow}</p>}<h2 className="display text-2xl font-bold">{title}</h2></div>{action}</div>
}
