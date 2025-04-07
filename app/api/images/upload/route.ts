import { NextResponse } from "next/server"
import { storeFile } from "@/lib/gridfs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Store file in MongoDB GridFS
    console.log(`Uploading image to MongoDB: ${file.name}, size: ${file.size} bytes`)
    const fileId = await storeFile(file)

    // Return the file ID and URL to access it
    const imageUrl = `/api/images/${fileId}`
    console.log(`Upload successful: ${imageUrl}`)

    return NextResponse.json({
      success: true,
      fileId,
      url: imageUrl,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

