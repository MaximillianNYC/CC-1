import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

const API_BASE_URL = getApiBaseUrl();

const API = {
  getConceptEmoji: async (text) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/openai/emoji-generator`, { messages: [{ role: "user", content: text }] });
      return response.data.emoji;
    } catch (error) {
      console.error('Error in getConceptEmoji:', error.response?.data || error.message);
      throw error;
    }
  },

  getSolution: async (equation, model = 'gpt4') => {
    try {
      const prompt = `Solve this conceptual equation: ${equation}.`;
      const endpoint = model === 'gpt4' 
        ? '/api/openai/concept-calculator'
        : '/api/anthropic/concept-calculator';
        
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        messages: [{ role: "user", content: prompt }]
      });

      if (model === 'gpt4') {
        // Handle OpenAI response structure
        if (response.data?.choices?.[0]?.message) {
          return response.data.choices[0].message.content;
        }
      } else {
        // Handle Anthropic response structure
        if (response.data?.content) {
          return response.data.content;
        }
      }
      
      console.error('Unexpected response structure:', response.data);
      throw new Error('Unexpected response structure from server');
    } catch (error) {
      console.error('Error in getSolution:', error.response?.data || error.message);
      throw error;
    }
  },

  saveEquation: async (equation, solution) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/save-equation`, { equation, solution });
      return response.data;
    } catch (error) {
      console.error('Error saving equation:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default API;