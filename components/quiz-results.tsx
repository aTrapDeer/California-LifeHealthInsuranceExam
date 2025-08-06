"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Award, ArrowRight, BookOpen, BarChart3, ChevronDown, ChevronUp } from "lucide-react"
import type { Question } from "@/types/quiz"

interface QuizResultsProps {
  questions: Question[]
  userAnswers: Record<string, string>
  onStartNewQuiz: () => void
  onGenerateStudyGuide?: () => void
}

interface CategoryPerformance {
  category: string
  total: number
  correct: number
  percentage: number
}

export function QuizResults({ questions, userAnswers, onStartNewQuiz, onGenerateStudyGuide }: QuizResultsProps) {
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false)
  
  const correctAnswers = questions.filter((q) => userAnswers[q.id] === q.correctAnswer).length
  const wrongQuestions = questions.filter((q) => userAnswers[q.id] !== q.correctAnswer)

  const score = Math.round((correctAnswers / questions.length) * 100)

  // Calculate category performance
  const categoryPerformance: CategoryPerformance[] = []
  const categoryMap = new Map<string, { total: number; correct: number }>()

  questions.forEach((question) => {
    const category = question.category
    const isCorrect = userAnswers[question.id] === question.correctAnswer
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { total: 0, correct: 0 })
    }
    
    const current = categoryMap.get(category)!
    current.total += 1
    if (isCorrect) {
      current.correct += 1
    }
  })

  categoryMap.forEach((stats, category) => {
    categoryPerformance.push({
      category,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    })
  })

  // Sort categories by percentage (worst to best)
  categoryPerformance.sort((a, b) => a.percentage - b.percentage)

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

  const getCategoryColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 70) return "text-blue-500"
    if (percentage >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 80) return "bg-green-400"
    if (percentage >= 70) return "bg-blue-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
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

      {/* Category Performance Breakdown */}
      <div className="mb-8">
        <button
          onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
          className="flex items-center justify-between w-full p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-blue-700">Performance by Category</h3>
          </div>
          {showCategoryBreakdown ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600" />
          )}
        </button>
        
        {showCategoryBreakdown && (
          <div className="mt-4 space-y-4">
            {categoryPerformance.map((cat) => (
              <div key={cat.category} className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-800">{cat.category}</span>
                  <span className={`font-semibold ${getCategoryColor(cat.percentage)}`}>
                    {cat.correct}/{cat.total} ({cat.percentage}%)
                  </span>
                </div>
                <Progress 
                  value={cat.percentage} 
                  className="h-2"
                />
                <div className="mt-1">
                  <span className={`text-xs ${getProgressColor(cat.percentage)} px-2 py-1 rounded-full text-white`}>
                    {cat.percentage >= 90 ? "Excellent" : 
                     cat.percentage >= 80 ? "Very Good" : 
                     cat.percentage >= 70 ? "Good" : 
                     cat.percentage >= 60 ? "Satisfactory" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  <p className="text-sm text-blue-600 mt-1">
                    Category: {question.category}
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

      <div className="mt-8 text-center space-y-4">
        {wrongQuestions.length > 0 && onGenerateStudyGuide && (
          <div>
            <p className="text-blue-600 text-sm mb-4">
              Need help with the questions you missed? Get a personalized AI study guide!
            </p>
            <Button 
              onClick={onGenerateStudyGuide} 
              size="lg" 
              className="blue-button mb-4"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Generate Study Guide ({wrongQuestions.length} missed questions)
            </Button>
          </div>
        )}
        
        <Button onClick={onStartNewQuiz} size="lg" className="blue-button">
          Start New Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
