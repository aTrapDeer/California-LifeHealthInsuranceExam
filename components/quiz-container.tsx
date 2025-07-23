"use client"

import { useState, useEffect } from "react"
import { QuizQuestion } from "@/components/quiz-question"
import { QuizResults } from "@/components/quiz-results"
import { StudyGuide } from "@/components/study-guide"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import { shuffleArray } from "@/lib/utils"
import type { Question } from "@/types/quiz"

interface QuizContainerProps {
  questionCount: number
  selectedState: "CA" | "MO"
}

export function QuizContainer({ questionCount, selectedState }: QuizContainerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [showAnswersLive, setShowAnswersLive] = useState(false)
  const [currentStep, setCurrentStep] = useState<"setup" | "quiz" | "results" | "study-guide">("quiz")

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoadingError(null)
        const response = await fetch(`/api/questions?count=${questionCount}&state=${selectedState}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (!data.questions || data.questions.length === 0) {
          throw new Error("No questions were loaded")
        }
        
        setQuestions(data.questions)
      } catch (error) {
        console.error("Failed to load questions:", error)
        setLoadingError(error instanceof Error ? error.message : "Failed to load questions")
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [questionCount, selectedState])

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    setCurrentStep("results")
  }

  const startNewQuiz = () => {
    // Reset state without reloading the page
    setIsSubmitted(false)
    setUserAnswers({})
    setIsLoading(true)
    setLoadingError(null)
    setCurrentStep("quiz")
    
    // Reload questions instead of reloading the entire page
    const loadQuestions = async () => {
      try {
        setLoadingError(null)
        const response = await fetch(`/api/questions?count=${questionCount}&state=${selectedState}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (!data.questions || data.questions.length === 0) {
          throw new Error("No questions were loaded")
        }
        
        setQuestions(data.questions)
      } catch (error) {
        console.error("Failed to load questions:", error)
        setLoadingError(error instanceof Error ? error.message : "Failed to load questions")
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }

  const generateStudyGuide = () => {
    setCurrentStep("study-guide")
  }

  const backToResults = () => {
    setCurrentStep("results")
  }

  const backToSetup = () => {
    setCurrentStep("setup")
    // Trigger a page reload only when going back to setup
    window.location.reload()
  }

  const progressPercentage = Math.round((Object.keys(userAnswers).length / questions.length) * 100)

  if (isLoading) {
    return (
      <Card className="quiz-card p-8 flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-blue-700 text-lg">Loading your quiz questions...</p>
        <p className="text-blue-600 text-sm mt-2">
          {questionCount} questions • {selectedState} state
        </p>
      </Card>
    )
  }

  if (loadingError) {
    return (
      <Card className="quiz-card p-8 flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-red-600 mb-2">Error Loading Quiz</h3>
        <p className="text-red-500 text-center mb-4">{loadingError}</p>
        <div className="flex space-x-2">
          <Button onClick={startNewQuiz} className="blue-button">
            Try Again
          </Button>
          <Button onClick={backToSetup} variant="outline">
            Back to Setup
          </Button>
        </div>
      </Card>
    )
  }

  if (currentStep === "results") {
    return (
      <QuizResults 
        questions={questions} 
        userAnswers={userAnswers} 
        onStartNewQuiz={startNewQuiz}
        onGenerateStudyGuide={generateStudyGuide}
      />
    )
  }

  if (currentStep === "study-guide") {
    const wrongQuestions = questions
      .filter((q) => userAnswers[q.id] !== q.correctAnswer)
      .map((question) => ({
        question,
        userAnswer: userAnswers[question.id]
      }))

    const correctAnswers = questions.filter((q) => userAnswers[q.id] === q.correctAnswer).length
    const score = Math.round((correctAnswers / questions.length) * 100)

    return (
      <StudyGuide
        wrongQuestions={wrongQuestions}
        score={score}
        totalQuestions={questions.length}
        onBackToHome={startNewQuiz}
        onBackToResults={backToResults}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="quiz-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold quiz-gradient-text">Insurance Quiz ({selectedState})</h2>
            <p className="text-sm text-blue-600">{questions.length} questions to test your knowledge</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-answers" checked={showAnswersLive} onCheckedChange={setShowAnswersLive} />
            <Label htmlFor="show-answers" className="text-sm text-blue-700">
              Show answers live
            </Label>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-600">
              {Object.keys(userAnswers).length} of {questions.length} answered
            </span>
            <span className="font-medium text-blue-700">{progressPercentage}% Complete</span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 bg-blue-100"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-700"
          />
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              index={index}
              selectedAnswer={userAnswers[question.id]}
              onSelectAnswer={(answer) => handleAnswerSelect(question.id, answer)}
              showCorrectAnswer={showAnswersLive && userAnswers[question.id] !== undefined}
              isSubmitted={isSubmitted}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={backToSetup} className="text-blue-600 border-blue-300 hover:bg-blue-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length < questions.length}
            className="blue-button"
          >
            Submit Quiz
          </Button>
        </div>
      </Card>
    </div>
  )
}
