"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Calendar, Phone, Mail, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import { getTeamsWithSchoolsAndSessions } from "@/lib/supabase-queries"
import type { Team } from "@/lib/supabase"

export default function ServicesShowcase() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        const data = await getTeamsWithSchoolsAndSessions()
        setTeams(data)
      } catch (err) {
        setError("Failed to load teams")
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teams...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50" id="services">
      <div className="container px-4">
        <AnimatedSection animation="fade-down" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl wild-youth-text-blue mb-6">AVAILABLE TEAMS</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join one of our active teams and start your athletic journey
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team, index) => (
            <AnimatedSection key={team.teamid} animation="fade-up" delay={index * 100}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(team.name)}`}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ${team.price}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>

                  {team.school && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {team.school.name} - {team.school.location}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">Max {team.participants} participants</span>
                  </div>

                  {team.session && team.session.length > 0 && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {team.session[0].dayofweek}s, {team.session[0].starttime} - {team.session[0].endtime}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{team.description}</p>

                  {team.session?.[0]?.staff && (
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900">Coach: {team.session[0].staff.name}</p>
                      <div className="flex items-center text-gray-600 text-xs mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="mr-3">{team.session[0].staff.email}</span>
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{team.session[0].staff.phone}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      // Scroll to registration section with team pre-selected
                      const registerSection = document.getElementById("register")
                      if (registerSection) {
                        registerSection.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Register for Team
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No active teams available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later or contact us for more information.</p>
          </div>
        )}
      </div>
    </section>
  )
}
