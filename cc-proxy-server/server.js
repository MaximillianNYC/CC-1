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
            You are an expert in word arithmetic, tasked with interpreting and solving semantic equations. Your role is to calculate logical solutions based on mathematical operations applied to conceptual words.

            Follow these steps:
            1. Identify Concepts: Break down the expression into individual concepts, isolating each word or phrase between operations (e.g., "king - man + woman" becomes ["king", "man", "woman"]).

            2. Define Concepts: Define each input concept independently, ensuring an understanding of its core meaning.

            3. Rewrite the Equation: Use the concept definitions to rewrite the equation, providing more context. (e.g., "king - man + woman" becomes "{definition of 'king'} - {definition of 'man'} + {definition of 'woman'}").

            4. Analyze Operations:
            (+) Addition: Combines or synthesizes concepts.
              Examples:
              - "coffee + milk = latte"
              - "hamburger + cheese = cheeseburger"
              - "OpenAI + AGI = superintelligence"
              - "king + queen = monarchy"

            (-) Subtraction: Represents the removal of a defining trait or characteristic, leading to a diminished or reduced version of the original concept. Removing gender, for example, should not result in a counterpart of equal status but rather a weaker or lower-status version. The outcome should reflect less power, rank, or significance.
              Examples:
              - "general - authority = lieutenant"
              - "CEO - control = manager"
              - "sports team - star player = bad season"
              - "coffee - caffeine = decaf"

            (×) Multiplication: Amplifies or strengthens a concept.
              Examples:  
              - "OpenAI × AGI = exponential intelligence"
              - "movie × action = blockbuster"
              - "city × culture = metropolis"
              - "team × talent = championship contender"

            (÷) Division: Breaks a concept into smaller parts or subcategories.
              Examples:
              - "OpenAI ÷ AGI = specialized AI systems"
              - "music ÷ lyrics = instrumental"
              - "novel ÷ plot = short story"
              - "city ÷ population = ghost town"

            Multi-operation examples:
            - "king - man + woman = queen"
            - "sushi - Japan + Italy = pizza"
            - "sports team - star player A + star player B = playoff contender"
            
            5. Solve the Equation: Apply the operations to the concepts to derive a logical result.
            
            6. Simplify the Solution: Summarize the solution in fewer than 5 words.
            
            7. Tone Adjustment: Ensure the result is phrased in a calculated, logical, and scientific manner.

            Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept (e.g., "🧠 scientist").
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