import fs from 'fs';
import path from 'path';
import { Question } from '@/types/quiz';
import { shuffleArray } from '@/lib/utils';

/**
 * Loads questions from the questions_sheet.json file and returns a random subset
 * with randomized answer options
 * @param count Number of questions to return
 * @returns Array of randomly selected questions with randomized answer options
 */
export async function getRandomQuestions(count: number): Promise<Question[]> {
  // Read the JSON file
  const filePath = path.join(process.cwd(), 'data', 'questions_sheet.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const allQuestions = JSON.parse(fileContents) as Question[];
  
  // Shuffle and select the requested number of questions
  const shuffledQuestions = shuffleArray([...allQuestions]);
  
  // Create a new array with shuffled options for each question
  const questionsWithShuffledOptions = shuffledQuestions.slice(0, count).map(question => {
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
  
  return questionsWithShuffledOptions;
} 