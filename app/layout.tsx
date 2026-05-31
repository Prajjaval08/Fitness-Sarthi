import type { Metadata } from "next"
import "./globals.css"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Fitness Saarthi | Your AI Fitness Companion",
  description: "Personalized fitness coaching built for your journey.",
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}<ThemeToggle className="fixed bottom-20 right-5 z-[100] md:bottom-5"/></body></html>
}
