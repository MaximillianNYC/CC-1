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

  getSolution: async (equation) => {
    try {
      const prompt = `Solve this conceptual equation: ${equation}.`;
      const response = await axios.post(`${API_BASE_URL}/api/concept-calculator`, { messages: [{ role: "user", content: prompt }] });
      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const solution = response.data.choices[0].message.content;
        return solution;
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Unexpected response structure from server');
      }
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