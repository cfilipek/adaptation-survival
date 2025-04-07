import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if we have the Vercel Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log("BLOB_READ_WRITE_TOKEN not found, using placeholder image")

      // Return a placeholder image URL instead
      return NextResponse.json({
        success: true,
        url: `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(file.name)}`,
        note: "Using placeholder due to missing Blob token",
      })
    }

    // Generate a unique filename
    const extension = file.name.split(".").pop() || "jpg"
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`

    // Log upload attempt
    console.log(`Attempting to upload file: ${uniqueFilename}, size: ${file.size} bytes`)

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: "public",
    })

    console.log(`Upload successful: ${blob.url}`)

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Return a placeholder image URL on error
    return NextResponse.json({
      success: true,
      url: `/placeholder.svg?height=200&width=200&text=Upload%20Error`,
      error: error.message,
    })
  }
}

