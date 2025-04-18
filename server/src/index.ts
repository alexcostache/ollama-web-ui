import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import apiRouter from './routes/api_routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_API = process.env.OLLAMA_API || 'http://localhost:11434';

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Check if build directory exists
const buildPath = path.join(__dirname, '../../client/build');
const buildExists = fs.existsSync(buildPath);

if (buildExists) {
  // Serve static files from the React app
  app.use(express.static(buildPath));

  // The "catchall" handler for any request not handled by the API
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('Client build directory not found. Run "cd client && npm run build" first or use development mode.');
  // If in development mode, we don't need to serve static files, as the React dev server will handle it
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).send('Client build not found. In development mode, access the React app directly at http://localhost:3000');
    }
  });
}

// Create HTTP server
const server = http.createServer(app);

// Set up socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', async (data) => {
    try {
      const { message, model } = data;
      console.log(`Processing chat with model ${model} via Socket.io`);
      
      // Create Ollama API request with streaming enabled
      const response = await axios.post(`${OLLAMA_API}/api/generate`, {
        model,
        prompt: message,
        stream: true
      }, {
        responseType: 'stream'
      });

      let fullResponse = '';
      let responseId = '';

      // Process each chunk from Ollama and emit to client
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.response) {
              fullResponse += data.response;
              // Emit each chunk immediately to the client
              socket.emit('chat response chunk', data.response);
            }
            
            if (data.done) {
              responseId = data.id || '';
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      });

      // Handle completion
      response.data.on('end', () => {
        socket.emit('chat response complete', responseId || Date.now().toString());
        console.log('Streaming completed');
      });
      
      // Handle errors
      response.data.on('error', (error: Error) => {
        console.error('Stream error:', error);
        socket.emit('chat response error', error.message);
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('chat response error', 'Failed to process message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Ollama Web UI server running at http://localhost:${PORT}`);
  if (!buildExists) {
    console.log(`For development, the React client should be running at http://localhost:3000`);
  }
});

// Helper function for streaming responses
async function streamResponse(socket: any, message: string, model: string): Promise<{id: string, text: string}> {
  const axios = require('axios');
  
  try {
    const response = await axios.post(`${OLLAMA_API}/api/generate`, {
      model,
      prompt: message,
      stream: true
    }, {
      responseType: 'stream'
    });

    let fullResponse = '';
    let responseId = '';

    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          
          if (data.response) {
            fullResponse += data.response;
            socket.emit('chat response chunk', data.response);
          }
          
          if (data.done) {
            responseId = data.id || '';
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    });

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve({ id: responseId, text: fullResponse });
      });
      
      response.data.on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error streaming response:', error);
    throw error;
  }
}

export default server; 