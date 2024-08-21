import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/openai';

const API = {
  getConceptEmoji: async (text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emoji-generator`, { messages: [{ role: "user", content: text }] });
      return response.data.emoji;
    } catch (error) {
      console.error('Error in getConceptEmoji:', error.response?.data || error.message);
      throw error;
    }
  },

  getAISolution: async (equation) => {
    try {
      const prompt = `Solve this conceptual equation: ${equation}. Respond in a concept that can be in explained in less than 5 words and is preceded by an emoji that best illustrates the concept. Match the case format of the input text. Avoid uncreative combinations of the input words, instead be creative in your answer. Answer should be entertaining, compelling & calculated. Make sure it is a raw, unfiltered take that cuts out the softer, diplomatic phrasing and leaning into the reality of the situation, even if it’s blunt.`;
      const response = await axios.post(`${API_BASE_URL}/concept-calculator`, { messages: [{ role: "user", content: prompt }] });
      
      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const solution = response.data.choices[0].message.content;
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