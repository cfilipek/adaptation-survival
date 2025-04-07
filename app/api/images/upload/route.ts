import { NextResponse } from "next/server"
import { storeFile } from "@/lib/gridfs"

export const maxDuration = 30 // Set max duration to 30 seconds for Netlify functions

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (limit to 2MB for faster uploads)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 2MB." }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Store file in MongoDB GridFS
    console.log(`Uploading image to MongoDB: ${file.name}, size: ${file.size} bytes`)

    // Add timeout handling
    const uploadPromise = storeFile(file)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out")), 25000))

    // Race the upload against the timeout
    const fileId = (await Promise.race([uploadPromise, timeoutPromise])) as string

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

    // Return a more specific error message
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
        details: error.message,
        suggestion: "Try uploading a smaller image or skip the image upload",
      },
      { status: 500 },
    )
  }
}

