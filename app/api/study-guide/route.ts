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

    const questionsText = wrongQuestions
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

Here are the questions they got wrong:
${questionsText}

Please create a comprehensive study guide that:
1. **Identifies Key Learning Areas**: Group the missed questions by topic/concept
2. **Explains Core Concepts**: For each topic, provide clear explanations of the fundamental concepts
3. **Common Mistakes**: Explain why their incorrect answers were wrong and what misconceptions to avoid
4. **Study Tips**: Provide specific actionable study recommendations
5. **Key Takeaways**: Summarize the most important points to remember

Format your response in clear sections with headers. Make it encouraging but informative, suitable for someone preparing for their insurance examination.
`

    const { text } = await generateText({
      model: openai("o3-mini"),
      prompt,
      system: "You are an expert in health and life insurance education who creates comprehensive, easy-to-understand study guides. Focus on helping students understand concepts they struggled with and provide practical study strategies.",
    })

    return NextResponse.json({ studyGuide: text })
  } catch (error) {
    console.error("Error generating study guide:", error)
    return NextResponse.json({ error: "Failed to generate study guide" }, { status: 500 })
  }
} 