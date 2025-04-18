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

// Streaming chat completion endpoint
router.post('/chat-stream', async (req, res) => {
  const { message, model } = req.body;
  
  console.log(`Processing streaming chat request with model: ${model}`);
  
  try {
    // Set up proper headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Make request to Ollama with streaming enabled
    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model,
      prompt: message,
      stream: true
    }, {
      responseType: 'stream'
    });
    
    let id = '';
    
    // Handle streaming response
    response.data.on('data', (chunk: any) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.response) {
            // Send data to client as SSE
            res.write(`data: ${JSON.stringify({ text: data.response })}\n\n`);
          }
          
          if (data.done) {
            id = data.id || '';
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    });
    
    // End the response when streaming is complete
    response.data.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true, id })}\n\n`);
      res.end();
    });
    
    // Handle any errors
    response.data.on('error', (error: any) => {
      console.error('Error in stream:', error);
      res.end();
    });
    
    // Handle client disconnect
    req.on('close', () => {
      response.data.destroy();
    });
  } catch (error) {
    console.error('Error setting up stream:', error);
    res.status(500).json({ error: 'Failed to generate streaming response' });
  }
});

// Chat completion endpoint (non-streaming API call)
router.post('/chat', async (req, res) => {
  try {
    const { message, model } = req.body;
    
    console.log(`Processing chat request with model: ${model}, message: "${message.substring(0, 50)}..."`);
    
    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model,
      prompt: message,
      stream: false
    });
    
    console.log('Received response from Ollama API');
    
    if (response.data && response.data.response) {
      return res.json({
        id: response.data.id || Date.now().toString(),
        text: response.data.response,
        model: model
      });
    } else {
      console.error('Invalid response format from Ollama:', response.data);
      throw new Error('Invalid response format from Ollama');
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

export default router; 