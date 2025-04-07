import { put } from "@vercel/blob"

export async function uploadImage(file: File) {
  try {
    const blob = await put(file.name, file, {
      access: "public",
    })

    return {
      success: true,
      url: blob.url,
      size: blob.size,
    }
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    return {
      success: false,
      error: "Failed to upload image",
    }
  }
}

