"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { AIExplanation } from "@/components/ai-explanation"
import type { Question } from "@/types/quiz"

interface QuizQuestionProps {
  question: Question
  index: number
  selectedAnswer: string | undefined
  onSelectAnswer: (answer: string) => void
  showCorrectAnswer: boolean
  isSubmitted: boolean
}

export function QuizQuestion({
  question,
  index,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer,
  isSubmitted,
}: QuizQuestionProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  const isCorrect = selectedAnswer === question.correctAnswer

  return (
    <Card className="quiz-card p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-blue-800">
          <span className="text-blue-600 mr-2 font-bold">Q{index + 1}.</span>
          {question.text}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Ask AI
        </Button>
      </div>

      {showExplanation && <AIExplanation question={question} />}

      <RadioGroup value={selectedAnswer} onValueChange={onSelectAnswer} className="mt-3 space-y-2">
        {question.options.map((option) => (
          <div
            key={option}
            className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${
              showCorrectAnswer && option === question.correctAnswer
                ? "bg-green-50 border border-green-200"
                : showCorrectAnswer && option === selectedAnswer && !isCorrect
                  ? "bg-red-50 border border-red-200"
                  : "hover:bg-blue-100 border border-blue-200 bg-blue-50"
            }`}
          >
            <RadioGroupItem value={option} id={`${question.id}-${option}`} className="text-blue-600" />
            <Label htmlFor={`${question.id}-${option}`} className="flex-grow cursor-pointer text-blue-700">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showCorrectAnswer && (
        <div
          className={`mt-3 p-3 rounded-md text-sm ${
            isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {isCorrect ? "Correct! Well done." : `Incorrect. The correct answer is: ${question.correctAnswer}`}
        </div>
      )}
    </Card>
  )
}
