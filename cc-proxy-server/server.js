const express = require('express');
//const axios = require('axios');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
app.post('/api/openai/concept-calculator', async (req, res) => {
  try {
    const { messages, max_tokens } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are an advanced Concept Calculator, designed to interpret input expressions that represent abstract relationships between concepts. Your goal is to analyze the words representing these concepts, locate their corresponding dot products in your training data, then use the specific operations provided to do arithmetic on their semantic embeddings to return a corresponding dot product which will you map to the closests corresponding natural language.

        Follow this process:
        1. Review the input expression and isolate each set of words inbetween operations (e.g. if the expression is "king - man + woman" you should create this array: "king, man, woman").
        2. Individually map each set of words to a corresponding dot product in the vector database from your training data (e.g. take your array, "king, man, woman", and find their corresponding dot products, "(123), (456), (789)").
        3. Use these dot products to rewrite the input expression with numbers instead of words (e.g. "king - man + woman" becomes "(123) - (456) + (789)").
        4. Perform the numerical arithmatic to arrive at a numerical solution.
        5. Use this numerical solution to find the closest dot product(s) in the vector database from your training data.
        6. Take this dot product's corresponding sematic embedding & provide it to the user as the answer to their equation.

        Apply this approach consistently to all input equations. Focus on ensuring that each step of the process is logically sound and conceptually meaningful. Let's think step by step.` },
        ...messages
      ],
      max_tokens: max_tokens || 1000,
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
      max_tokens: 1,
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

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});