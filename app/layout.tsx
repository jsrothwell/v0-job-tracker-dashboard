import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Job Tracker - Manage Your Applications",
  description: "Track and visualize your job application journey",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>{children}</body>
    </html>
  )
}
