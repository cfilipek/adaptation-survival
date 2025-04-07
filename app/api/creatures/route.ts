import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Creature } from "@/lib/models"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get("environment")

    const client = await clientPromise
    const db = client.db("adaptation-survival")

    let query = {}
    if (environment) {
      query = { environment }
    }

    const creatures = await db.collection("creatures").find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ creatures })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch creatures" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.adaptationType || !data.environment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("adaptation-survival")

    // Calculate survival chance based on adaptation and environment
    // This would be more sophisticated in a real app
    const survivalChance = Math.floor(Math.random() * 30) + 50 // 50-80% base chance

    // Use a placeholder image if no image URL was provided
    const imageUrl = data.imageUrl || "/placeholder.svg?height=100&width=100"

    const newCreature: Creature = {
      name: data.name,
      adaptationType: data.adaptationType,
      adaptationDescription: data.adaptationDescription,
      statBonuses: data.statBonuses,
      statDrawback: data.statDrawback,
      environment: data.environment,
      imageUrl,
      imageId: data.imageId || "",
      survivalChance,
      createdAt: new Date(),
    }

    const result = await db.collection("creatures").insertOne(newCreature)

    return NextResponse.json(
      {
        creature: {
          ...newCreature,
          _id: result.insertedId,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create creature" }, { status: 500 })
  }
}

