import fs from 'fs';
import path from 'path';
import { Question } from '@/types/quiz';
import { shuffleArray } from '@/lib/utils';

/**
 * Loads questions from the questions_sheet.json file and returns a balanced subset
 * with even distribution across categories and randomized answer options.
 * @param count Number of questions to return
 * @param state Selected state for state-specific questions (CA or MO)
 * @returns Array of questions with balanced category distribution and randomized answer options
 */
export async function getRandomQuestions(count: number, state?: "CA" | "MO" | null): Promise<Question[]> {
  // Read the JSON file
  const filePath = path.join(process.cwd(), 'data', 'questions_sheet.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const allQuestions = JSON.parse(fileContents) as Question[];
  
  // If no state is specified, return balanced questions from all categories
  if (!state) {
    return getBalancedQuestions(allQuestions, count);
  }

  // Filter questions by state
  const generalQuestions = allQuestions.filter(q => q.state === "Gen");
  const stateQuestions = allQuestions.filter(q => q.state === state);
  
  // Calculate distribution: 30% state-specific, 70% general
  const stateQuestionCount = Math.round(count * 0.3);
  const generalQuestionCount = count - stateQuestionCount;
  
  // Get balanced state-specific questions
  const selectedStateQuestions = getBalancedQuestions(stateQuestions, stateQuestionCount);
  
  // Get balanced general questions
  const selectedGeneralQuestions = getBalancedQuestions(generalQuestions, generalQuestionCount);
  
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
 * Gets balanced questions across all categories
 * @param questions Array of questions to select from
 * @param count Number of questions to return
 * @returns Array of questions with balanced category distribution
 */
function getBalancedQuestions(questions: Question[], count: number): Question[] {
  // Group questions by category
  const questionsByCategory: Record<string, Question[]> = {};
  
  questions.forEach(question => {
    if (!questionsByCategory[question.category]) {
      questionsByCategory[question.category] = [];
    }
    questionsByCategory[question.category].push(question);
  });
  
  // Get all available categories
  const categories = Object.keys(questionsByCategory);
  
  if (categories.length === 0) {
    return [];
  }
  
  // Calculate how many questions to take from each category
  const questionsPerCategory = Math.floor(count / categories.length);
  const remainder = count % categories.length;
  
  const selectedQuestions: Question[] = [];
  
  // Shuffle categories to randomize which ones get extra questions
  const shuffledCategories = shuffleArray([...categories]);
  
  // Select questions from each category
  shuffledCategories.forEach((category, index) => {
    const categoryQuestions = questionsByCategory[category];
    const shuffledCategoryQuestions = shuffleArray([...categoryQuestions]);
    
    // Add one extra question to the first 'remainder' categories
    const questionsToTake = questionsPerCategory + (index < remainder ? 1 : 0);
    const selectedFromCategory = shuffledCategoryQuestions.slice(0, questionsToTake);
    
    selectedQuestions.push(...selectedFromCategory);
  });
  
  return selectedQuestions;
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