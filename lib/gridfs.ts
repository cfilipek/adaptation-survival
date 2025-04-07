import { GridFSBucket, ObjectId } from "mongodb"
import clientPromise from "./mongodb"

// Function to get a GridFS bucket
export async function getGridFSBucket() {
  const client = await clientPromise
  const db = client.db("adaptation-survival")
  return new GridFSBucket(db, { bucketName: "images" })
}

// Function to store a file in GridFS
export async function storeFile(file: File): Promise<string> {
  const bucket = await getGridFSBucket()

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  // Create a unique filename
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.name}`

  // Create a writable stream and write the buffer to it
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        size: file.size,
        uploadDate: new Date(),
      },
    })

    uploadStream.write(buffer)
    uploadStream.end()

    uploadStream.on("finish", () => {
      resolve(uploadStream.id.toString())
    })

    uploadStream.on("error", (error) => {
      reject(error)
    })
  })
}

// Function to retrieve a file from GridFS
export async function getFileById(id: string) {
  try {
    const bucket = await getGridFSBucket()
    const _id = new ObjectId(id)

    // Get file info
    const files = await bucket.find({ _id }).toArray()
    if (files.length === 0) {
      throw new Error("File not found")
    }

    const file = files[0]

    // Create a download stream
    const downloadStream = bucket.openDownloadStream(_id)

    // Convert stream to buffer
    return new Promise<{ buffer: Buffer; contentType: string }>((resolve, reject) => {
      const chunks: Buffer[] = []

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk)
      })

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks)
        resolve({
          buffer,
          contentType: file.contentType || "application/octet-stream",
        })
      })

      downloadStream.on("error", (error) => {
        reject(error)
      })
    })
  } catch (error) {
    console.error("Error retrieving file:", error)
    throw error
  }
}

// Function to delete a file from GridFS
export async function deleteFileById(id: string): Promise<boolean> {
  try {
    const bucket = await getGridFSBucket()
    await bucket.delete(new ObjectId(id))
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

