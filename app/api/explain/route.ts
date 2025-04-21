import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { question, options, correctAnswer } = await request.json()

    const prompt = `
Question: ${question}
Options: ${options.join(", ")}
Correct Answer: ${correctAnswer}

Please explain this insurance concept in simple terms. Explain why the correct answer is right and why the other options are incorrect. Keep your explanation concise but informative, suitable for someone learning about insurance.
`

    const { text } = await generateText({
      model: openai("o3-mini"),
      prompt,
      system:
        "You are an expert in California health and life insurance who explains complex concepts in simple, easy-to-understand language.",
    })

    return NextResponse.json({ explanation: text })
  } catch (error) {
    console.error("Error generating explanation:", error)
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 })
  }
}
