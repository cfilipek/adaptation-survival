import { NextResponse } from "next/server"
import { debugDatabase } from "@/lib/debug-db"

export async function GET() {
  try {
    const debugInfo = await debugDatabase()
    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ error: "Debug failed", message: error.message }, { status: 500 })
  }
}

