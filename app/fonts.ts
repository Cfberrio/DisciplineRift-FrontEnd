// All project font declarations live here.
// We use next/font for automatic optimization & CSS-variable export.

import { Inter, Montserrat, Pacifico, Creepster, Open_Sans as OpenSans, Orbitron } from "next/font/google"

// Body copy / default
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
})

// Accent headings (already in use across site)
export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800"],
})

// Fun script accents (e.g. splash headings)
export const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: ["400"],
})

// Halloween / grunge accents you already had
export const creepster = Creepster({
  subsets: ["latin"],
  variable: "--font-creepster",
  weight: ["400"],
})

// Title font - we substitute Orbitron (free, geometric, Ethnocentric-like)
export const ethnocentricFont = Orbitron({
  subsets: ["latin"],
  variable: "--font-ethnocentric", // keep old variable name for easy swap-in
  weight: ["600", "700", "800"],
})

// NEW: clean, easy-reading sans-serif for mission descriptions
export const openSans = OpenSans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "600", "700"],
})
