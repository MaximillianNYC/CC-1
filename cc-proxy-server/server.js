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
            You are an expert in word arithmetic, tasked with interpreting and solving semantic equations. Your role is to calculate logical solutions based on mathematical operations applied to conceptual words. Each operation has a distinct effect, and results should vary according to the unique role of each operation. Below is a list of instructions for each operation.

            (+) Addition: Combine the best traits of multiple concepts to form a new concept where the result is an expansion or a blended outcome that maintains identifiable characteristics of both inputs. This result is generally positive or neutral and emphasizes co-existence. Examples:
              - "coffee + milk = latte" (combines coffee and milk to create a new drink)
              - "hamburger + cheese = cheeseburger" (adds an ingredient to form a variation)
              - "OpenAI + AGI = superintelligence" (merging AI with AGI to enhance capabilities)
              - "king + queen = monarchy" (combining two figures into a unified system)

            (-) Subtraction: Remove a defining trait or core characteristic, leading to a diminished or simplified version of the original concept. The key is that subtraction results in something less than the original concept, not just in a different form, but weakened in meaning, value, or complexity. Examples:
              - "general - authority = lieutenant" (lowered rank due to loss of authority)
              - "CEO - control = manager" (reduced influence or status)
              - "sports team - star player = bad season" (team weakened by player loss)
              - "coffee - caffeine = decaf" (removing a key component to reduce intensity)

            (×) Multiplication: Amplifies or exaggerates key traits of the original concept, resulting in a more powerful, enhanced version. The output should feel stronger or more exaggerated than the sum of its parts. Multiplication can also imply synergy, where the result is more than the sum of the individual elements. Examples:  
              - "OpenAI × AGI = exponential intelligence" (multiplied intelligence capabilities)
              - "movie × action = blockbuster" (intensified action results in a larger-scale movie)
              - "city × culture = metropolis" (increased cultural influence leads to a global city)
              - "team × talent = championship contender" (amplified talent increases competitiveness)

            (÷) Division: Breakdown a concept into specific, smaller components or fragments, with a narrower scope or purpose. The result should be more specific or focused, often resulting in a subset or fragment of the original idea, rather than a new combination or synergy. Examples:
              - "OpenAI ÷ AGI = specialized AI systems" (narrowing down AGI capabilities into specific functions)
              - "music ÷ lyrics = instrumental" (isolating the musical aspect from the lyrical content)
              - "novel ÷ plot = short story" (removing complexity to create a simpler narrative)
              - "city ÷ population = ghost town" (a city reduced by the loss of people)

            Multi-operation examples:
            - "king - man + woman = queen"
            - "sushi - Japan + Italy = pizza"
            - "sports team - star player A + star player B = playoff contender"

            General guidance:
              - Ensure each operation leads to a distinct result. Addition creates a new integrated concept, subtraction reduces or weakens, multiplication intensifies or amplifies, and division fragments or simplifies.
              - Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept (e.g., "🧠 scientist").
          `
        },
        ...messages
      ],
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
    console.log('Attempting to save equation:', { equation, solution });
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
    if (process.env.POSTGRES_URL) {
      await sql`INSERT INTO equations (equation, solution) VALUES (${equation}, ${solution})`;
      console.log('Equation saved successfully');
      res.status(200).json({ message: 'Equation saved successfully' });
    } else {
      console.log('POSTGRES_URL not found, skipping database save');
      res.status(200).json({ message: 'Equation processed (database save skipped)' });
    }
  } catch (error) {
    console.error('Error saving equation:', error);
    res.status(500).json({ error: 'Failed to save equation', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Concept Calculator API');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: process.env.NODE_ENV });
});

console.log('Current environment:', process.env.NODE_ENV);
console.log('CORS origin:', corsOptions.origin);

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  console.log('Server port:', port);
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

console.log('OpenAI API Key set:', !!process.env.OPENAI_API_KEY);

module.exports = app;