# AI Algorithm Advisor

![GitHub](https://img.shields.io/badge/React-19.2.0-blue)
![GitHub](https://img.shields.io/badge/TypeScript-5.8.2-blue)
![GitHub](https://img.shields.io/badge/Vite-6.2.0-orange)
![GitHub](https://img.shields.io/badge/Gemini-2.5-green)

A smart AI-powered companion for Data Structures & Algorithms (DSA) students. Built for the VIT Vellore DSA Project, this application leverages Google's Gemini AI to analyze your problem descriptions and suggest optimal algorithms with complexity analysis, runnable C code snippets, and Mermaid.js flowcharts.

## Features

- **AI-Powered Algorithm Recommendations**: Describe your problem in natural language and get tailored algorithm suggestions powered by **Gemini 2.5 Pro**.
- **Complexity Analysis**: Get detailed time and space complexity breakdowns (best, average, and worst case) for each recommended algorithm.
- **Runnable C Code Snippets**: Complete, compilable C implementations with comments and test cases.
- **Mermaid.js Flowcharts**: Visual flowcharts for each algorithm to understand the logic flow.
- **Difficulty Filtering**: Filter recommendations by difficulty level (Easy, Medium, Hard).
- **Search & Filter**: Search through recommendations by keyword and filter by difficulty.
- **Save Algorithms**: Bookmark your favorite algorithm suggestions for later reference (persisted via localStorage).
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing.
- **AI Chatbot ("Algo")**: A conversational AI assistant for DSA-related questions, powered by **Gemini 2.5 Flash**.
- **Quick Explain**: Get instant explanations of algorithm concepts.
- **Grounded Search**: Find real-world examples and applications of algorithms with web-sourced results.
- **Code Translation**: Translate C code to other programming languages.
- **Interactive Code Editor**: Edit and experiment with generated code snippets.
- **Example Prompts**: Pre-filled example problems to get started quickly.

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19.2.0, TypeScript 5.8.2 |
| Build Tool | Vite 6.2.0 |
| Styling | Tailwind CSS |
| AI/LLM | Google Gemini 2.5 Pro, Gemini 2.5 Flash, Google GenAI SDK |
| Visualization | Mermaid.js |
| State Management | React Context API |

## Project Structure

```
DSA-Project/
├── components/           # Reusable React components
│   ├── AlgorithmCard.tsx       # Displays algorithm suggestion cards
│   ├── ChatBot.tsx             # Conversational AI chatbot interface
│   ├── ChatBubble.tsx          # Chat message bubbles
│   ├── ChatIcon.tsx            # Floating chatbot trigger button
│   ├── CollapsibleSection.tsx  # Expandable/collapsible content
│   ├── ComplexityChart.tsx     # Visual complexity comparison
│   ├── DifficultyFilter.tsx    # Filter by difficulty level
│   ├── ErrorDisplay.tsx        # Error message display
│   ├── GroundedSearch.tsx      # Web-grounded search results
│   ├── InteractiveCodeEditor.tsx # Editable code editor
│   ├── LoadingSpinner.tsx      # Loading animation
│   ├── ProblemInput.tsx        # Problem description textarea
│   ├── QuickExplain.tsx        # Quick algorithm explanations
│   ├── SavedAlgorithmsList.tsx # List of saved algorithms
│   └── ThemeToggleButton.tsx   # Dark/light mode toggle
├── contexts/             # React Context providers
│   └── ThemeContext.tsx        # Theme management context
├── services/             # API service layer
│   ├── geminiService.ts        # Gemini AI API integration
│   └── geminiService.test.ts   # Unit tests for the service
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── index.html            # HTML template
├── types.ts              # TypeScript type definitions
├── package.json          # Project dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── .gitignore            # Git ignore rules
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shroff45/DSA-Project.git
   cd DSA-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` or `.env.local` file in the root directory:
   ```
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

1. **Problem Input**: The user describes a programming problem or algorithmic challenge in natural language.
2. **AI Analysis**: The app sends the problem to the Gemini 2.5 Pro model with a structured prompt that instructs it to analyze requirements and recommend algorithms.
3. **Structured Response**: Gemini returns a JSON response containing:
   - A summary of the problem analysis
   - Recommended algorithms with:
     - Time & space complexity
     - Data structures used
     - Difficulty rating
     - C code implementation
     - Mermaid.js flowchart
     - Related algorithms
4. **Display**: The app renders the recommendations as interactive cards with filtering, search, and save functionality.

## AI Integration Details

### Models Used

| Model | Purpose |
|-------|--------|
| **Gemini 2.5 Pro** | Main algorithm advisor - generates detailed, structured algorithm recommendations |
| **Gemini 2.5 Flash** | Chatbot, quick explanations, grounded search, and code translation (faster, cheaper) |

### API Functions

- `getAlgorithmAdvice(problemDescription)` - Main function for getting algorithm recommendations
- `startChat()` - Initializes the conversational chatbot
- `sendMessageStream(message)` - Sends a message to the chatbot and streams the response
- `getQuickExplanation(algorithmName, question)` - Provides quick algorithm explanations
- `getGroundedResponse(algorithmName)` - Fetches real-world examples with web grounding
- `translateCode(code, targetLanguage)` - Translates C code to other languages

## Configuration

### Tailwind CSS

The app uses Tailwind CSS for styling with dark mode support. Customizations can be made in the `vite.config.ts` and inline within components.

### TypeScript

All type definitions are located in `types.ts`, including:
- `AdvisorResponse` - The structured AI response type
- `AlgorithmSuggestion` - Individual algorithm recommendation
- `TimeComplexity` - Best/average/worst case complexity
- `RelatedAlgorithm` - Alternative algorithm suggestions
- `GroundingChunk` - Web-sourced reference data

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built for the **DSA Project** at **VIT Vellore**
- Powered by **Google Gemini AI** ([Google GenAI SDK](https://www.npmjs.com/package/@google/genai))
- Inspired by the Google AI Studio repository template

---

**Built with ❤️ by [Sai Swarup Shroff](https://github.com/shroff45)**
