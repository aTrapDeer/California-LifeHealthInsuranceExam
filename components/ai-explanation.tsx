"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card" 
import { Loader2, Sparkles } from "lucide-react"
import type { Question } from "@/types/quiz"

interface AIExplanationProps {
  question: Question
}

export function AIExplanation({ question }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getExplanation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.text,
            options: question.options,
            correctAnswer: question.correctAnswer,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 408) {
            throw new Error("Request timed out")
          }
          throw new Error("Failed to get explanation")
        }

        const data = await response.json()
        setExplanation(data.explanation)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Request timed out. The AI service may be busy.")
        } else {
          setError("Unable to load explanation right now.")
        }
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    getExplanation()
  }, [question])

  return (
    <Card className="p-4 mt-2 mb-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
      <div className="flex items-center mb-2">
        <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
        <h4 className="text-sm font-medium text-blue-700">AI Explanation</h4>
      </div>

      {isLoading ? (
        <div className="flex items-center space-x-2 text-sm text-blue-600 p-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span>Generating explanation...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-amber-600 p-2">
          <p>{error}</p>
          <p className="text-xs mt-1">Try refreshing or asking again later.</p>
        </div>
      ) : (
        <div className="text-sm text-blue-700 whitespace-pre-line p-2">{explanation}</div>
      )}
    </Card>
  )
}
