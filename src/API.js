import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/openai';

const API = {
  getConceptEmoji: async (text) => {
    try {
      console.log('Sending request to emoji-generator with text:', text);
      const response = await axios.post(`${API_BASE_URL}/emoji-generator`, { messages: [{ role: "user", content: text }] });
      console.log('Received response from emoji-generator:', response.data);
      return response.data.emoji;
    } catch (error) {
      console.error('Error in getConceptEmoji:', error.response?.data || error.message);
      throw error;
    }
  },

  getAISolution: async (equation) => {
    try {
      const prompt = `Solve this conceptual equation: ${equation}. Respond in a single concept preceeded by an emoji that best illustrates the concept. Match the case format of the input text. Avoid uncreative combinations of the input words, instead be creative in your answer.`;
      console.log('Sending request to concept-calculator with prompt:', prompt);
      const response = await axios.post(`${API_BASE_URL}/concept-calculator`, { messages: [{ role: "user", content: prompt }] });
      console.log('Received response from concept-calculator:', response.data);
      
      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const solution = response.data.choices[0].message.content;
        console.log('Extracted solution:', solution);
        return solution;
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Unexpected response structure from server');
      }
    } catch (error) {
      console.error('Error in getAISolution:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default API;