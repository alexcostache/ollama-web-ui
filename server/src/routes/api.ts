import express from 'express';
import axios from 'axios';

const router = express.Router();
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';

// Get list of available models
router.get('/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_API}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models from Ollama' });
  }
});

// Generate a chat completion (non-streaming)
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model,
      prompt,
      stream: false
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router; 