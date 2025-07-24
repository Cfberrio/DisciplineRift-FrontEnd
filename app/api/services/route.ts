/**
 * API Route for fetching and creating services/programs from Supabase
 */
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Fetch services data directly from Supabase
    const { data: services, error } = await supabase
      .from("service")
      .select(`
        serviceid,
        name,
        description,
        price,
        duration,
        category,
        isactive
      `)
      .eq("isactive", true)
      .order("name")

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }

    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error("Unexpected error fetching services:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, duration, category } = await request.json()

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new service
    const { data: service, error } = await supabase
      .from("service")
      .insert({
        name,
        description,
        price,
        duration: duration || 60,
        category: category || "General",
        isactive: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating service:", error)
      return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error creating service:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
