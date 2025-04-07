import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { deleteFileById } from "@/lib/gridfs"

// Fix the type definition for the route handler
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Missing creature ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("adaptation-survival")

    // First, get the creature to check if it has an image ID
    const creature = await db.collection("creatures").findOne({
      _id: new ObjectId(id),
    })

    if (!creature) {
      return NextResponse.json({ error: "Creature not found" }, { status: 404 })
    }

    // If the creature has an image ID, delete the image from GridFS
    if (creature.imageId) {
      try {
        await deleteFileById(creature.imageId)
      } catch (error) {
        console.error("Error deleting image:", error)
        // Continue with creature deletion even if image deletion fails
      }
    }

    // Delete the creature from the database
    const result = await db.collection("creatures").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete creature" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Creature deleted successfully",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete creature" }, { status: 500 })
  }
}

