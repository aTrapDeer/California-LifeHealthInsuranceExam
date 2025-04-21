import { QuizSetup } from "@/components/quiz-setup"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 py-8 px-4 md:py-12">
      <div className="max-w-5xl mx-auto">
        <QuizSetup />
        
        <footer className="mt-8 text-center text-blue-600 text-sm opacity-80">
          <p>© {new Date().getFullYear()} Insurance Exam Preparation</p>
        </footer>
      </div>
    </main>
  )
}
