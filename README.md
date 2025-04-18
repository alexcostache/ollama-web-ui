# Ollama Web UI

A lightweight web user interface for interacting with Ollama models locally.

## Features

- Chat interface for conversations with Ollama models
- Real-time streaming responses via Socket.io
- Code syntax highlighting and Markdown rendering
- Multiple color themes (Light, Dark, Night, Nord, and Solarized Light)
- Chat history management with the ability to delete individual chats
- Model selection from available Ollama models
- Remembers the selected model between sessions
- Command-line executable via `ollama-web-ui` command

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Ollama](https://ollama.ai) running locally

## Quick Start

1. Clone this repository:
   ```
   git clone https://github.com/alexcostache/ollama-web-ui.git
   cd ollama-web-ui
   ```

2. Install dependencies:
   ```
   npm run install:all
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000

## Installation

### Global Installation

```
npm install -g .
```

After installation, you can run the UI from any terminal:

```
ollama-web-ui
```

This will start the server and open the UI in your default browser.

### Manual Installation

1. Clone the repository:
   ```
   git clone https://github.com/alexcostache/ollama-web-ui.git
   cd ollama-web-ui
   ```

2. Install dependencies:
   ```
   npm run install:all
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Configuration

The server can be configured using environment variables. Create a `.env` file in the `server` directory (you can copy from `.env.example`):

```
# Server port
PORT=3001

# Ollama API endpoint
OLLAMA_API=http://localhost:11434

# Set to production in production environments
NODE_ENV=development
```

## Development

### Project Structure

- `/client` - React frontend application
- `/server` - Node.js/Express backend server
- `/docs` - Documentation files

### Running in Development Mode

```
npm run dev
```

This will start both the client and server in development mode with hot reloading.

## Building for Production

```
npm run build
```

This will build both the client and server for production.

## License

MIT

## Acknowledgements

- [Ollama](https://ollama.ai) - For the amazing local LLM runtime
- [React](https://reactjs.org/) - Frontend library
- [Express](https://expressjs.com/) - Backend server
- [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting 