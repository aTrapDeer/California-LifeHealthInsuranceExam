export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  state: "Gen" | "CA" | "MO"
  category: string
}
