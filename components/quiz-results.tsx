"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Award, ArrowRight } from "lucide-react"
import type { Question } from "@/types/quiz"

interface QuizResultsProps {
  questions: Question[]
  userAnswers: Record<string, string>
  onStartNewQuiz: () => void
}

export function QuizResults({ questions, userAnswers, onStartNewQuiz }: QuizResultsProps) {
  const correctAnswers = questions.filter((q) => userAnswers[q.id] === q.correctAnswer).length

  const score = Math.round((correctAnswers / questions.length) * 100)

  const getGradeLabel = (score: number) => {
    if (score >= 90)
      return { label: "Excellent", color: "text-green-600", icon: <Award className="h-12 w-12 text-yellow-500" /> }
    if (score >= 80)
      return { label: "Very Good", color: "text-green-500", icon: <Award className="h-12 w-12 text-green-500" /> }
    if (score >= 70)
      return { label: "Good", color: "text-blue-500", icon: <Award className="h-12 w-12 text-blue-500" /> }
    if (score >= 60)
      return { label: "Satisfactory", color: "text-yellow-500", icon: <Award className="h-12 w-12 text-yellow-500" /> }
    return { label: "Needs Improvement", color: "text-red-500", icon: <Award className="h-12 w-12 text-red-500" /> }
  }

  const grade = getGradeLabel(score)

  return (
    <Card className="quiz-card p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">{grade.icon}</div>
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Quiz Results</h2>
        <div className="text-6xl font-bold mb-2 quiz-gradient-text">{score}%</div>
        <div className={`text-xl font-medium ${grade.color} mb-2`}>{grade.label}</div>
        <p className="text-blue-600">
          You answered {correctAnswers} out of {questions.length} questions correctly
        </p>
      </div>

      <div className="space-y-6 mt-8">
        <h3 className="text-xl font-semibold border-b border-blue-200 pb-2 text-blue-700">Question Review</h3>

        {questions.map((question, index) => {
          const userAnswer = userAnswers[question.id]
          const isCorrect = userAnswer === question.correctAnswer

          return (
            <div key={question.id} className="border-b border-blue-100 pb-4 last:border-b-0">
              <div className="flex items-start">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-blue-800">
                    <span className="text-blue-600 mr-2">Q{index + 1}.</span>
                    {question.text}
                  </p>

                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-blue-600">Your answer:</span>{" "}
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>{userAnswer}</span>
                    </p>

                    {!isCorrect && (
                      <p>
                        <span className="font-medium text-blue-600">Correct answer:</span>{" "}
                        <span className="text-green-600">{question.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <Button onClick={onStartNewQuiz} size="lg" className="blue-button">
          Start New Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
