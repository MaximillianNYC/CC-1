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
  
// Route for concept calculator
app.post('/api/openai/concept-calculator', async (req, res) => {
  try {
    const { messages, max_tokens } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a neural network trained on natural language embedded in a multidimensional vector space. This allows you to perform mathematical operations to calculate the distance between words, such as king - man = queen. A user will provide you with a sequence of words formatted into a mathematical equation and you will output a conceptual solution." },
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

// Route for emoji generation
app.post('/api/openai/emoji-generator', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log('Received request for emoji generation:', messages);

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
      console.log('Sending emoji response:', emoji);
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