const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://cc-1-roan.vercel.app',
  'https://conceptcalculator.com',
  'https://www.conceptcalculator.com',
  'https://conceptcalculator.ai',
  'https://www.conceptcalculator.ai'
];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
app.post('/api/openai/concept-calculator', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", 
          content: 
          `
            You are an expert in word arithmetic and analogies using vector representations of words. Your task is to perform word analogies and vector arithmetic operations.

            Instructions:
            1. Words are represented as vectors in a high-dimensional space.
            2. Use cosine similarity to compare word vectors and find the most similar words.
            3. For analogies of the form "a is to b as c is to d", use the formula:
              vector(b) - vector(a) + vector(c) ≈ vector(d)
            4. When given a word arithmetic problem, break it down into vector operations.
            5. Always explain your reasoning step by step.
            6. Provide the final answer as the word that best fits the analogy or arithmetic operation.

            Remember:
            - Cosine similarity ranges from -1 to 1, with 1 indicating the highest similarity.
            - The closest word vector may not always be semantically perfect; consider context.
            - Some words may not have vector representations; inform the user if this occurs.

            Format your response as follows:
            1. Restate the problem
            2. Explain the vector operations
            3. Describe the similarity calculation process
            4. Provide the final answer

            Example:
            Input: "man is to king as woman is to ?"
            Output:
            1. Problem: Find the word that completes the analogy "man is to king as woman is to ?"
            2. Vector operation: vector("king") - vector("man") + vector("woman")
            3. Calculate cosine similarity between the result and all word vectors in the vocabulary
            4. Final answer: queen (highest cosine similarity to the resulting vector) 

            Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept (e.g., "🧠 scientist").
          `
        },
        ...messages
      ],
      store: true,
      metadata: {
        endpoint: "operation"
      },
      max_tokens: 1000,
    });
    res.json(completion);
  } catch (error) {
    console.error('Error in concept calculator:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/openai/emoji-generator', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI that suggests a single emoji that best represents a given concept. Respond with only the emoji, nothing else." },
        ...messages
      ],
      store: true,
      metadata: {
        endpoint: "emojigen"
      },
      max_tokens: 5,
    });

    console.log('OpenAI API Response:', completion);

    if (completion.choices && completion.choices[0] && completion.choices[0].message) {
      const emoji = completion.choices[0].message.content.trim();
      res.json({ emoji: emoji });
    } else {
      console.error('Unexpected OpenAI API response structure:', completion);
      res.status(500).json({ error: 'Unexpected API response structure' });
    }
  } catch (error) {
    console.error('Error in emoji generator:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-equation', async (req, res) => {
  try {
    const { equation, solution } = req.body;
    if (process.env.POSTGRES_URL) {
      await sql`INSERT INTO equations (equation, solution) VALUES (${equation}, ${solution})`;
      res.status(200).json({ message: 'Equation saved successfully' });
    } else {
      res.status(200).json({ message: 'Equation processed (database save skipped)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save equation', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Concept Calculator API');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: process.env.NODE_ENV });
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {});
}

module.exports = app;