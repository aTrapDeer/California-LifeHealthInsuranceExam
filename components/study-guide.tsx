"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Home, ArrowLeft, Sparkles } from "lucide-react"
import type { Question } from "@/types/quiz"

interface StudyGuideProps {
  wrongQuestions: {
    question: Question
    userAnswer: string
  }[]
  score: number
  totalQuestions: number
  onBackToHome: () => void
  onBackToResults: () => void
}

export function StudyGuide({ 
  wrongQuestions, 
  score, 
  totalQuestions, 
  onBackToHome, 
  onBackToResults 
}: StudyGuideProps) {
  const [studyGuide, setStudyGuide] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateStudyGuide = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/study-guide", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wrongQuestions,
            score,
            totalQuestions,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate study guide")
        }

        const data = await response.json()
        setStudyGuide(data.studyGuide)
      } catch (err) {
        setError("Unable to generate study guide. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    generateStudyGuide()
  }, [wrongQuestions, score, totalQuestions])

  // Format the study guide text with proper line breaks and sections
  const formatStudyGuide = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim()
        
        // Headers (lines that start with ## or are in caps)
        if (trimmedLine.startsWith('##') || 
            (trimmedLine.length > 0 && trimmedLine === trimmedLine.toUpperCase() && 
             trimmedLine.includes(' ') && !trimmedLine.includes('.'))) {
          return (
            <h3 key={index} className="text-lg font-bold text-blue-800 mt-6 mb-3 border-b border-blue-200 pb-2">
              {trimmedLine.replace(/^#+\s*/, '')}
            </h3>
          )
        }
        
        // Sub-headers (lines with **text**)
        if (trimmedLine.includes('**')) {
          const formatted = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700">$1</strong>')
          return (
            <h4 key={index} className="font-semibold text-blue-700 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />
          )
        }
        
        // Numbered lists
        if (/^\d+\./.test(trimmedLine)) {
          return (
            <div key={index} className="ml-4 mb-2">
              <p className="text-blue-800">{trimmedLine}</p>
            </div>
          )
        }
        
        // Bullet points
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
          return (
            <div key={index} className="ml-6 mb-2">
              <p className="text-blue-700">{trimmedLine}</p>
            </div>
          )
        }
        
        // Regular paragraphs
        if (trimmedLine.length > 0) {
          return (
            <p key={index} className="text-blue-800 mb-3 leading-relaxed">
              {trimmedLine}
            </p>
          )
        }
        
        // Empty lines
        return <div key={index} className="h-2" />
      })
  }

  return (
    <Card className="quiz-card p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold quiz-gradient-text">Your Personalized Study Guide</h1>
            <p className="text-blue-600 text-sm">
              Based on your quiz performance: {score}% ({totalQuestions - wrongQuestions.length}/{totalQuestions} correct)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onBackToResults} 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <p className="text-blue-700 text-lg">AI is creating your personalized study guide...</p>
          </div>
          <p className="text-blue-600 text-sm mt-2">This may take a few moments</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="blue-button">
            Try Again
          </Button>
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
            <div className="flex items-center mb-2">
              <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-blue-700">AI-Generated Study Guide</h3>
            </div>
            <p className="text-xs text-blue-600">
              This study guide was created specifically for the {wrongQuestions.length} questions you missed.
            </p>
          </div>

          <div className="prose prose-blue max-w-none">
            {formatStudyGuide(studyGuide)}
          </div>

          <div className="mt-12 pt-6 border-t border-blue-200 text-center space-y-4">
            <p className="text-blue-600 text-sm">
              Ready to test your knowledge again?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onBackToHome} 
                size="lg" 
                className="blue-button"
              >
                <Home className="h-4 w-4 mr-2" />
                Take Another Quiz
              </Button>
              <Button 
                onClick={onBackToResults} 
                variant="outline" 
                size="lg"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
} 