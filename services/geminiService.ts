import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { AdvisorResponse, GroundingChunk } from '../types';

/**
 * Parses a Gemini API error into a user-friendly string.
 * @param error The error object.
 * @returns A string message for the user.
 */
const parseGeminiError = (error: unknown): string => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            return 'The AI service is not configured correctly. Missing API Key.';
        }
        // Check if it's a JSON parsing error
        if (error.name === 'SyntaxError') {
             return 'The AI returned a response in an unexpected format. This can happen with complex queries. Please try simplifying your problem description.';
        }
    }
    return 'An unexpected error occurred while communicating with the AI. Please try again shortly.';
}


// --- Main Algorithm Advisor Function ---

const getAlgorithmAdviceSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A one-sentence summary of why these algorithms were chosen for the user's problem." },
    recommendations: {
      type: Type.ARRAY,
      description: "An array of 1 to 3 recommended algorithms. Prioritize the most relevant one first.",
      items: {
        type: Type.OBJECT,
        properties: {
          algorithmName: { type: Type.STRING, description: "The full name of the algorithm (e.g., 'Quicksort', 'Dijkstra\\'s Algorithm')." },
          dataStructures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary data structures used by this algorithm (e.g., ['Array', 'Stack'])." },
          description: { type: Type.STRING, description: "A concise, 2-3 sentence technical description of how the algorithm works." },
          difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'], description: "The typical difficulty level for a student to implement this algorithm." },
          timeComplexity: {
            type: Type.OBJECT,
            properties: {
              best: { type: Type.STRING, description: "Best-case time complexity in Big O notation (e.g., 'O(n log n)')." },
              average: { type: Type.STRING, description: "Average-case time complexity in Big O notation." },
              worst: { type: Type.STRING, description: "Worst-case time complexity in Big O notation." }
            },
            required: ["best", "average", "worst"]
          },
          spaceComplexity: { type: Type.STRING, description: "Worst-case space complexity in Big O notation (e.g., 'O(log n)')." },
          useCase: { type: Type.STRING, description: "Explain in 2-3 sentences *specifically* why this algorithm is a good fit for the user's described problem. Connect it directly to their request." },
          cCodeSnippet: { type: Type.STRING, description: "A complete, runnable, and well-commented C code snippet demonstrating the algorithm. Include necessary headers like <stdio.h>. The code should be practical and easy to understand for a student." },
          relatedAlgorithms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING, description: "A brief explanation of why this related algorithm is relevant (e.g., 'A stable alternative', 'Solves a similar problem')." }
              },
              required: ["name", "reason"]
            },
            description: "A list of 2-3 related algorithms a student might also want to explore."
          },
          mermaidFlowchart: {
            type: Type.STRING,
            description: "A Mermaid.js flowchart diagram (using 'graph TD;' for top-down) that visually represents the key steps of the algorithm. Use concise labels for nodes. For example: 'graph TD; A[Start] --> B(Process Data); B --> C{Decision}; C -->|Yes| D[End]; C -->|No| B;'"
          }
        },
        required: ["algorithmName", "dataStructures", "description", "difficulty", "timeComplexity", "spaceComplexity", "useCase", "cCodeSnippet", "relatedAlgorithms", "mermaidFlowchart"]
      }
    }
  },
  required: ["summary", "recommendations"]
};


export const getAlgorithmAdvice = async (problemDescription: string): Promise<AdvisorResponse> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable is not set.');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are an expert Computer Science professor specializing in Data Structures and Algorithms (DSA) for C programming, specifically for students at VIT Vellore.
A student will describe a problem, and your task is to provide a detailed, structured analysis recommending the best algorithms and data structures.
Your response MUST be in JSON format and strictly adhere to the provided schema.
Generate complete, runnable C code snippets.
The 'useCase' field is critical: you must explicitly connect your recommendation to the user's specific problem description.
The 'mermaidFlowchart' must be a valid Mermaid.js 'graph TD' syntax string.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: problemDescription,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: getAlgorithmAdviceSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as AdvisorResponse;
        return parsedResponse;

    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};

// --- Quick Explanation Function ---

export const getQuickExplanation = async (algorithmName: string, question: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not set.');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `In the context of the "${algorithmName}" algorithm, concisely explain the following for a university student. Keep it simple and direct.
    
    Question: "${question}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5, // Lower temp for more factual, less creative answers
            }
        });
        return response.text;
    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};


// --- Grounded Search Function ---

export const getGroundedResponse = async (algorithmName: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY is not set.');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Find and summarize 1-2 real-world examples or recent applications of the "${algorithmName}" algorithm. Provide web sources.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk as GroundingChunk) ?? [];
        
        return {
            text: response.text,
            sources: sources
        };

    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};


// --- Chatbot Functions ---

let chat: Chat | null = null;

export const startChat = () => {
    if (!process.env.API_KEY) {
        console.error('API_KEY is not set. Chatbot will not function.');
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are Algo, a friendly and helpful AI assistant for a student learning Data Structures and Algorithms (DSA) in C. Keep your answers concise, clear, and encouraging. Use markdown for formatting, like `code` for snippets and **bold** for key terms. Do not answer questions unrelated to DSA, C programming, or computer science concepts.",
        },
    });
};

export const sendMessageStream = async (message: string) => {
    if (!chat) {
        startChat(); // Attempt to re-initialize if not ready
        if (!chat) {
            throw new Error("Chat session is not initialized. Please ensure the API key is available.");
        }
    }
    return chat.sendMessageStream({ message });
};
