"use client"

import { useEffect, useState } from "react"
import { Sparkles, Trophy } from "lucide-react"

interface CelebrationToastProps {
  show: boolean
  onComplete: () => void
  jobTitle: string
}

export function CelebrationToast({ show, onComplete, jobTitle }: CelebrationToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onComplete, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-in fade-in zoom-in duration-300 pointer-events-auto">
        <div className="glass-card rounded-2xl p-6 shadow-2xl max-w-md mx-4 border-2 border-accent/30">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="relative">
                <Trophy className="h-12 w-12 text-accent animate-bounce" />
                <Sparkles className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">Congratulations! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                You moved <span className="font-semibold text-accent">{jobTitle}</span> to Offer!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 20}%`,
              backgroundColor: `oklch(${0.5 + Math.random() * 0.3} ${0.1 + Math.random() * 0.1} ${170 + Math.random() * 40})`,
              animationDelay: `${Math.random() * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
