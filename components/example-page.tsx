"use client"

import { Button } from "@/components/ui/button"
import SectionBackground from "@/components/section-background"
import BrushstrokeTitle from "@/components/brushstroke-title"
import HeroLayout from "@/components/hero-layout"
import Link from "next/link"

export default function ExamplePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section with Passion Camp inspired layout */}
      <HeroLayout
        title="DISCIPLINE RIFT"
        subtitle="Volleyball Camp"
        date="JULY 15-20, 2025"
        location="LOS ANGELES, CA"
        backgroundImage="/high-school-volleyball-game.png"
      >
        <Button className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-10 py-6 text-lg mt-8">
          REGISTER NOW
        </Button>
      </HeroLayout>

      {/* About Section with gradient background */}
      <SectionBackground variant="gradient" className="py-20">
        <div className="container px-4">
          <BrushstrokeTitle color="white" size="xl" className="mb-12">
            ABOUT THE CAMP
          </BrushstrokeTitle>

          <div className="max-w-3xl mx-auto text-white text-lg">
            <p className="mb-6">
              Join us for an intensive volleyball training experience designed to elevate your game to the next level.
              Our camp combines technical skill development, tactical understanding, and competitive play in a
              supportive and challenging environment.
            </p>
            <p className="mb-6">
              Led by former collegiate and professional players, our coaching staff brings decades of experience and a
              passion for developing young athletes both on and off the court.
            </p>
            <div className="flex justify-center mt-10">
              <Button className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-8 py-4">
                LEARN MORE
              </Button>
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* Programs Section with image background */}
      <SectionBackground
        variant="image"
        image="/high-school-volleyball-training.png"
        overlayOpacity={0.8}
        className="py-20"
      >
        <div className="container px-4">
          <BrushstrokeTitle color="white" size="xl" className="mb-12">
            PROGRAMS
          </BrushstrokeTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Program Card 1 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                              <h3 className="text-2xl ethnocentric-title-white mb-4">VOLLEYBALL</h3>
              <p className="text-white/90 mb-6">
                Introduction and skill development in serving, passing, setting, hitting, blocking, and defensive
                strategies.
              </p>
              <Link href="#" className="text-white font-bold hover:text-blue-200 inline-flex items-center">
                LEARN MORE
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Program Card 2 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                              <h3 className="text-2xl ethnocentric-title-white mb-4">TENNIS</h3>
              <p className="text-white/90 mb-6">
                Fundamental skills including serving, forehand, backhand, volleying, and court movement.
              </p>
              <Link href="#" className="text-white font-bold hover:text-blue-200 inline-flex items-center">
                LEARN MORE
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Program Card 3 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                              <h3 className="text-2xl ethnocentric-title-white mb-4">PICKLEBALL</h3>
              <p className="text-white/90 mb-6">
                Developing foundational pickleball skills: serving, dinking, volleying, strategic shot placement, and
                footwork.
              </p>
              <Link href="#" className="text-white font-bold hover:text-blue-200 inline-flex items-center">
                LEARN MORE
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-8 py-4">
              VIEW ALL PROGRAMS
            </Button>
          </div>
        </div>
      </SectionBackground>

      {/* Schedule Section with light background */}
      <SectionBackground variant="light" className="py-20">
        <div className="container px-4">
          <BrushstrokeTitle color="blue" size="xl" className="mb-12">
            SCHEDULE
          </BrushstrokeTitle>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Day 1 */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-blue-800 mb-2">DAY 1: FUNDAMENTALS</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>9:00 AM - Check-in and Welcome</li>
                  <li>10:00 AM - Skills Assessment</li>
                  <li>12:00 PM - Lunch Break</li>
                  <li>1:00 PM - Fundamental Drills</li>
                  <li>3:00 PM - Team Building Activities</li>
                  <li>5:00 PM - Day Wrap-up</li>
                </ul>
              </div>

              {/* Day 2 */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-blue-800 mb-2">DAY 2: SKILL DEVELOPMENT</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>9:00 AM - Morning Warm-up</li>
                  <li>9:30 AM - Position-specific Training</li>
                  <li>12:00 PM - Lunch Break</li>
                  <li>1:00 PM - Advanced Techniques</li>
                  <li>3:00 PM - Scrimmage Games</li>
                  <li>5:00 PM - Day Wrap-up</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 py-4">
                FULL SCHEDULE
              </Button>
            </div>
          </div>
        </div>
      </SectionBackground>

      {/* Registration CTA with dark background */}
      <SectionBackground variant="dark" className="py-16">
        <div className="container px-4 text-center">
          <BrushstrokeTitle color="white" size="lg" className="mb-6">
            READY TO JOIN US?
          </BrushstrokeTitle>

          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Secure your spot today for our upcoming volleyball camp and take your game to the next level!
          </p>

          <Button className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-10 py-6 text-lg">
            REGISTER NOW
          </Button>
        </div>
      </SectionBackground>
    </main>
  )
}
