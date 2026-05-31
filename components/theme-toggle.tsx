"use client"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem("fitness-saarthi-theme")
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
    const next = saved ? saved === "light" : prefersLight
    setLight(next)
    document.documentElement.classList.toggle("light", next)
  }, [])
  function toggle() {
    const next = !light
    setLight(next)
    localStorage.setItem("fitness-saarthi-theme", next ? "light" : "dark")
    document.documentElement.classList.toggle("light", next)
  }
  return <button aria-label={`Switch to ${light ? "dark" : "light"} mode`} onClick={toggle} className={`hover-lift grid size-10 place-items-center rounded-xl border border-white/[.08] bg-white/[.06] ${className}`}>{light ? <Moon size={17}/> : <Sun size={17}/>}</button>
}
