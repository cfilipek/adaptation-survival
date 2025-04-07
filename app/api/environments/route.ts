import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Default environments to seed the database if none exist
const defaultEnvironments = [
  {
    id: "marine",
    name: "Marine",
    description: "Deep ocean environment with high pressure and limited light.",
  },
  {
    id: "rainforest",
    name: "Rainforest",
    description: "Dense vegetation with high humidity and biodiversity.",
  },
  {
    id: "tundra",
    name: "Tundra",
    description: "Cold environment with permafrost and limited vegetation.",
  },
  {
    id: "desert",
    name: "Desert",
    description: "Arid environment with extreme temperature variations.",
  },
  {
    id: "grassland",
    name: "Grassland",
    description: "Open terrain with grasses and few trees.",
  },
]

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("adaptation-survival")

    // Check if environments collection has data
    const count = await db.collection("environments").countDocuments()

    // If no environments exist, seed the database
    if (count === 0) {
      await db.collection("environments").insertMany(defaultEnvironments)
    }

    const environments = await db.collection("environments").find({}).toArray()

    // Make sure we're returning the environments in the expected format
    return NextResponse.json({
      environments: environments.map((env) => ({
        id: env.id || env._id.toString(),
        name: env.name,
        description: env.description,
      })),
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch environments" }, { status: 500 })
  }
}

