// Simple script to test the OpenAI API integration
// Run with: node test-api.js

const testApi = async () => {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'What is term life insurance?',
        options: [
          'Insurance that only covers a specific period of time',
          'Insurance that covers your entire life',
          'Insurance for your car',
          'Insurance for your home'
        ],
        correctAnswer: 'Insurance that only covers a specific period of time'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success! API response:');
    console.log(data.explanation);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testApi(); 