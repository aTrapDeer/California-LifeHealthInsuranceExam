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
        })

        if (!response.ok) {
          throw new Error("Failed to get explanation")
        }

        const data = await response.json()
        setExplanation(data.explanation)
      } catch (err) {
        setError("Unable to load explanation. Please try again later.")
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
        <p className="text-sm text-red-500 p-2">{error}</p>
      ) : (
        <div className="text-sm text-blue-700 whitespace-pre-line p-2">{explanation}</div>
      )}
    </Card>
  )
}
