import fs from 'fs';
import path from 'path';
import { Question } from '@/types/quiz';
import { shuffleArray } from '@/lib/utils';

/**
 * Loads questions from the questions_sheet.json file and returns a random subset
 * with randomized answer options. Implements 30% state-specific + 70% general distribution.
 * @param count Number of questions to return
 * @param state Selected state for state-specific questions (CA or MO)
 * @returns Array of randomly selected questions with randomized answer options
 */
export async function getRandomQuestions(count: number, state?: "CA" | "MO" | null): Promise<Question[]> {
  // Read the JSON file
  const filePath = path.join(process.cwd(), 'data', 'questions_sheet.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const allQuestions = JSON.parse(fileContents) as Question[];
  
  // If no state is specified, return random questions from all categories
  if (!state) {
    const shuffledQuestions = shuffleArray([...allQuestions]);
    return processQuestions(shuffledQuestions.slice(0, count));
  }

  // Filter questions by category
  const generalQuestions = allQuestions.filter(q => q.state === "Gen");
  const stateQuestions = allQuestions.filter(q => q.state === state);
  
  // Calculate distribution: 30% state-specific, 70% general
  const stateQuestionCount = Math.round(count * 0.3);
  const generalQuestionCount = count - stateQuestionCount;
  
  // Get random state-specific questions
  const shuffledStateQuestions = shuffleArray([...stateQuestions]);
  const selectedStateQuestions = shuffledStateQuestions.slice(0, Math.min(stateQuestionCount, stateQuestions.length));
  
  // Get random general questions
  const shuffledGeneralQuestions = shuffleArray([...generalQuestions]);
  const selectedGeneralQuestions = shuffledGeneralQuestions.slice(0, Math.min(generalQuestionCount, generalQuestions.length));
  
  // Combine and shuffle the final set
  const combinedQuestions = [...selectedStateQuestions, ...selectedGeneralQuestions];
  
  // If we don't have enough questions, fill with any remaining questions
  if (combinedQuestions.length < count) {
    const usedIds = new Set(combinedQuestions.map(q => q.id));
    const remainingQuestions = allQuestions.filter(q => !usedIds.has(q.id));
    const shuffledRemaining = shuffleArray(remainingQuestions);
    const needed = count - combinedQuestions.length;
    combinedQuestions.push(...shuffledRemaining.slice(0, needed));
  }
  
  // Final shuffle and process questions
  const finalQuestions = shuffleArray(combinedQuestions);
  return processQuestions(finalQuestions.slice(0, count));
}

/**
 * Processes questions by shuffling their options
 * @param questions Array of questions to process
 * @returns Array of questions with shuffled options
 */
function processQuestions(questions: Question[]): Question[] {
  return questions.map(question => {
    // Create a new array of options that includes the correct answer
    const options = [...question.options];
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(options);
    
    // Return a new question object with the shuffled options
    return {
      ...question,
      options: shuffledOptions
    };
  });
} 