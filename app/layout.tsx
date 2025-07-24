import type React from "react"
import type { Metadata } from "next"
import { montserrat, inter, pacifico, ethnocentricFont, creepster, openSans } from "./fonts"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import V0SwFix from "@/components/v0-sw-fix"

export const metadata: Metadata = {
  title: "Discipline Rift - Youth Sports Development",
  description: "Developing Young Athletes in Volleyball, Tennis, & Pickleball",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${inter.variable} ${pacifico.variable} ${ethnocentricFont.variable} ${creepster.variable} ${openSans.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <V0SwFix />
        </ThemeProvider>
      </body>
    </html>
  )
}
