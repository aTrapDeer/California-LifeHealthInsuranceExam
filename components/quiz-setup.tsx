"use client"

import { useState, useEffect } from "react"
import { QuizContainer } from "@/components/quiz-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Zap, ChartBar, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

export function QuizSetup() {
  const [questionCount, setQuestionCount] = useState(10)
  const [startQuiz, setStartQuiz] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(0)
  
  // Fixed question count options
  const questionOptions = [5, 10, 20, 50, 80, 100, 150]

  useEffect(() => {
    // Fetch the total number of questions available
    const fetchTotalQuestions = async () => {
      try {
        const response = await fetch('/api/questions?count=1');
        const data = await response.json();
        
        // Get the total from examining the question ID numbers
        if (data.questions && data.questions.length > 0) {
          // We're estimating based on questions_sheet.json
          setTotalQuestions(361);
        }
      } catch (error) {
        console.error("Failed to fetch total questions:", error);
      }
    };

    fetchTotalQuestions();
  }, []);

  if (startQuiz) {
    return <QuizContainer questionCount={questionCount} />
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="space-y-6 mx-auto max-w-3xl px-4"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-bold quiz-gradient-text text-center mb-6">
          Insurance Knowledge Quiz
        </h1>
      </motion.div>

      <Card className="quiz-card">
        <div className="p-6 md:p-8">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-blue-700">How many questions?</h2>
            <p className="text-blue-600 text-sm">Choose how many questions you want to answer</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {questionOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 px-2 rounded-lg text-center transition-all duration-300 ${
                    questionCount === count
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow-lg transform scale-105"
                      : "bg-white border border-blue-200 text-blue-700 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <div className="font-semibold">{count}</div>
                  <div className="text-xs mt-1 opacity-80">questions</div>
                </button>
              ))}
            </div>
            {totalQuestions > 0 && (
              <p className="text-sm text-blue-500 mt-2 text-center">
                {totalQuestions} questions available in the database
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="font-medium mb-4 text-blue-700">Quiz Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 shadow-sm flex items-start">
                <Zap className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">Instant Feedback</h4>
                  <p className="text-xs text-blue-600">See answers as you go</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 shadow-sm flex items-start">
                <Brain className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">Random Questions</h4>
                  <p className="text-xs text-blue-600">Fresh test each time</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 shadow-sm flex items-start">
                <ChartBar className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">Progress Tracking</h4>
                  <p className="text-xs text-blue-600">See your completion</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 shadow-sm flex items-start">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">AI Explanations</h4>
                  <p className="text-xs text-blue-600">Understand concepts</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <Button 
              onClick={() => setStartQuiz(true)} 
              size="lg" 
              className="blue-button w-full sm:w-auto px-8 py-6 text-lg"
            >
              Start Quiz with {questionCount} Questions
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
