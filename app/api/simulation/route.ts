import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const { environmentId, creatureIds } = await request.json()

    if (!environmentId || !creatureIds || !Array.isArray(creatureIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("adaptation-survival")

    // Get all creatures for this environment
    // Fix: Properly convert string IDs to MongoDB ObjectId objects
    const creatures = await db
      .collection("creatures")
      .find({
        _id: { $in: creatureIds.map((id) => new ObjectId(id)) },
        environment: environmentId,
      })
      .toArray()

    // Generate a random event
    const events = ["Extreme weather", "Food shortage", "Predator invasion", "Disease outbreak", "Habitat destruction"]
    const eventType = events[Math.floor(Math.random() * events.length)]

    // Determine survivors based on adaptations and environment
    const survivors = creatures.filter((creature) => {
      // This would be more complex in a real application
      return Math.random() * 100 < (creature.survivalChance || 50)
    })

    // Create a simulation event record
    const simulationEvent = {
      environmentId,
      eventType,
      description: `${eventType} in the ${environmentId} environment`,
      createdAt: new Date(),
      survivors: survivors.map((s) => s._id.toString()),
      extinctCount: creatures.length - survivors.length,
    }

    // Save the simulation event
    await db.collection("simulation-events").insertOne(simulationEvent)

    return NextResponse.json({
      event: eventType,
      survivors: survivors.map((s) => s._id.toString()),
      extinctCount: creatures.length - survivors.length,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to run simulation" }, { status: 500 })
  }
}

