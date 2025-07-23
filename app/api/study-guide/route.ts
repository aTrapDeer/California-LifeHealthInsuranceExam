import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Question } from "@/types/quiz"

interface StudyGuideRequest {
  wrongQuestions: {
    question: Question
    userAnswer: string
  }[]
  score: number
  totalQuestions: number
}

export async function POST(request: Request) {
  try {
    const { wrongQuestions, score, totalQuestions }: StudyGuideRequest = await request.json()

    if (!wrongQuestions || wrongQuestions.length === 0) {
      return NextResponse.json({ error: "No wrong questions provided" }, { status: 400 })
    }

    // Limit the number of questions to prevent timeout
    const maxQuestions = 15
    const questionsToProcess = wrongQuestions.slice(0, maxQuestions)
    
    const questionsText = questionsToProcess
      .map(({ question, userAnswer }, index) => {
        return `
${index + 1}. Question: ${question.text}
   Your Answer: ${userAnswer}
   Correct Answer: ${question.correctAnswer}
   Options: ${question.options.join(", ")}
`
      })
      .join("\n")

    const prompt = `
You are an expert insurance educator creating a personalized study guide. A student just completed an insurance quiz and scored ${score}% (${totalQuestions - wrongQuestions.length}/${totalQuestions} correct).

Here are ${questionsToProcess.length} of the questions they got wrong${wrongQuestions.length > maxQuestions ? ` (showing ${maxQuestions} most recent)` : ''}:
${questionsText}

Please create a comprehensive study guide that:
1. **Identifies Key Learning Areas**: Group the missed questions by topic/concept
2. **Explains Core Concepts**: For each topic, provide clear explanations of the fundamental concepts
3. **Common Mistakes**: Explain why their incorrect answers were wrong and what misconceptions to avoid
4. **Study Tips**: Provide specific actionable study recommendations
5. **Key Takeaways**: Summarize the most important points to remember

Format your response in clear sections with headers. Make it encouraging but informative, suitable for someone preparing for their insurance examination.
`

    // Add timeout and error handling for OpenAI API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 45000) // 45 second timeout
    })

    const generatePromise = generateText({
      model: openai("gpt-3.5-turbo"), // Use faster model instead of o3-mini
      prompt,
      system: "You are an expert in health and life insurance education who creates comprehensive, easy-to-understand study guides. Focus on helping students understand concepts they struggled with and provide practical study strategies.",
      maxTokens: 2000, // Limit response length
    })

    const { text } = await Promise.race([generatePromise, timeoutPromise]) as { text: string }

    return NextResponse.json({ 
      studyGuide: text,
      questionsProcessed: questionsToProcess.length,
      totalWrongQuestions: wrongQuestions.length
    })
  } catch (error) {
    console.error("Error generating study guide:", error)
    
    // Return different error messages based on error type
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ 
        error: "The study guide is taking longer than expected to generate. Please try again with fewer questions or try again later." 
      }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: "Failed to generate study guide. Please try again later." 
    }, { status: 500 })
  }
} 