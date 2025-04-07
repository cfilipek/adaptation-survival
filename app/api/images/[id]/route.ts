import { NextResponse } from "next/server"
import { getFileById, deleteFileById } from "@/lib/gridfs"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 })
    }

    // Get file from GridFS
    const { buffer, contentType } = await getFileById(id)

    // Return the file with appropriate content type
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)

    if (error.message === "File not found") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 })
    }

    // Delete file from GridFS
    const success = await deleteFileById(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}

