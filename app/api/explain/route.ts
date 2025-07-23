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

    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000) // 25 second timeout
    })

    const generatePromise = generateText({
      model: openai("gpt-3.5-turbo"), // Use faster model instead of o3-mini
      prompt,
      system: "You are an expert in California health and life insurance who explains complex concepts in simple, easy-to-understand language.",
      maxTokens: 500, // Limit response length for faster processing
    })

    const { text } = await Promise.race([generatePromise, timeoutPromise]) as { text: string }

    return NextResponse.json({ explanation: text })
  } catch (error) {
    console.error("Error generating explanation:", error)
    
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ 
        error: "The explanation is taking longer than expected. Please try again." 
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: "Failed to generate explanation" 
    }, { status: 500 })
  }
}
