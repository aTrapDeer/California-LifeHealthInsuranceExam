import { NextRequest, NextResponse } from "next/server"
import { getRandomQuestions } from "@/lib/question-loader"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const count = parseInt(searchParams.get('count') || '15', 10)
  const state = searchParams.get('state') as "CA" | "MO" | null
  
  try {
    const questions = await getRandomQuestions(count, state)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error loading questions:", error)
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 }
    )
  }
}
