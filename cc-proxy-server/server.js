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
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", 
          content: 
          `
            You are an expert in word arithmetic. You interpret concepts combined with mathmatical operations to represent semantic equations. Your goal is to analyze these semantic equation and calculate a logical solution in the form of a new concept.
          
            Let's think step by step:
            1. Define each input concept: review the submitted expression and isolate each set of words inbetween operations (e.g. if the expression is "king - man + woman" you should create this array: "king, man, woman") these are the input concepts.
            2. Define each input concept: take each input concept and define it independently so you have a sufficient understanding of its individual significance.
            3. Rewrite the input equation: use the input concept definitions to rewrite the input expression so it provides more context (e.g. "king - man + woman" becomes "{definition of "king"} - {definition of "man"} + {definition of "queen"}").
            4. Analyze the operations: review each operations included in the equation and consider its function (e.g. addition = combining concepts to create a new and more meaningful concept, subtraction = removing a concept to simplify or reduce the meaning, multiplication = repeating a concept to strengthen or emphasize its effect, division = breaking a concept's meaning into smaller and separate parts).
            5. Solve the equation: calculate result of the operations on the input concept definitions.
            6. Simplify solution: summarize the conceptual solution into a result that is less than 5 words without any punctuation.
            7. Adjust the tone: take your simplified solution and adjust its language so the tone sounds calculated, logical, and scientific.

            Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept.

            Please review the examples below as a guide for your solutions:
            Example 1: "coffee + milk = latte", "coffee - milk = black coffee", "coffee x milk = cappucino"
            Example 2: "sushi - Japan + italy = pizza"
            Example 3: "coffee + hot = hot coffee"
            Example 4: "coffee x hot = burnt tongue"
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

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});