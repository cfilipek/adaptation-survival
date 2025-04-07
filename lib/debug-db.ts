import clientPromise from "./mongodb"

export async function debugDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...")
    const client = await clientPromise
    console.log("MongoDB connection successful")

    const db = client.db("adaptation-survival")

    // Check environments
    const envCount = await db.collection("environments").countDocuments()
    console.log(`Found ${envCount} environments in database`)

    if (envCount > 0) {
      const sampleEnv = await db.collection("environments").findOne({})
      console.log("Sample environment:", sampleEnv)
    }

    // Check creatures
    const creatureCount = await db.collection("creatures").countDocuments()
    console.log(`Found ${creatureCount} creatures in database`)

    if (creatureCount > 0) {
      const sampleCreature = await db.collection("creatures").findOne({})
      console.log("Sample creature:", sampleCreature)
    }

    return {
      connected: true,
      environmentCount: envCount,
      creatureCount: creatureCount,
    }
  } catch (error) {
    console.error("Database debug error:", error)
    return {
      connected: false,
      error: error.message,
    }
  }
}

