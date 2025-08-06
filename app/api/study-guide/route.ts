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

Please create a comprehensive study guide that focuses on TEACHING and LEARNING. For each missed question, you should:

1. **EXPLAIN WHY THEY GOT IT WRONG**: Analyze their incorrect answer and explain the specific misconception or misunderstanding that led to their mistake.

2. **TEACH THE CORRECT ANSWER**: Don't just state the right answer - explain WHY it's correct, the underlying concept, and how it relates to insurance principles.

3. **PROVIDE MEMORY TECHNIQUES**: Give specific mnemonics, patterns, or memory aids to help them remember the concept. Use acronyms, rhymes, or logical connections that make the information stick.

4. **SHOW THE PATTERNS**: Identify recurring themes or patterns across similar questions that they can use to answer future questions correctly.

5. **BUILD UNDERSTANDING**: Connect concepts to real-world scenarios or practical applications that make the abstract insurance concepts more concrete and memorable.

Structure your response with these sections:
- **Key Learning Areas**: Group questions by topic/concept
- **Detailed Explanations**: For each topic, explain why their answers were wrong and teach the correct concepts
- **Memory Techniques**: Provide specific mnemonics and patterns for each concept
- **Study Strategies**: Actionable tips for mastering these topics
- **Practice Recommendations**: Suggest how to apply this knowledge

Make your explanations encouraging and educational, focusing on helping them truly understand the concepts rather than just memorize answers. Use analogies, examples, and memory techniques that will help the information stick.
`

    // Add timeout and error handling for OpenAI API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 45000) // 45 second timeout
    })

    const generatePromise = generateText({
      model: openai("gpt-3.5-turbo"), // Use faster model instead of o3-mini
      prompt,
      system: "You are an expert insurance educator who specializes in teaching complex concepts through clear explanations, memory techniques, and practical examples. Your goal is to help students understand WHY they got questions wrong and provide them with tools to remember and apply the correct concepts. Use mnemonics, patterns, analogies, and real-world examples to make insurance concepts memorable and understandable.",
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