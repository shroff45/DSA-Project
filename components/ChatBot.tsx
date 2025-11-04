import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { sendMessageStream } from '../services/geminiService';
import ChatBubble from './ChatBubble';
import { GenerateContentResponse } from '@google/genai';

interface ChatBotProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hi! I\'m Algo, your AI assistant. How can I help you with Data Structures and Algorithms today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Trap focus within the modal for accessibility
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        // Add a placeholder for the model's response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            const stream = await sendMessageStream(input);
            for await (const chunk of stream) {
                const chunkText = (chunk as GenerateContentResponse).text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunkText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = 'Sorry, something went wrong. Please try again.';
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" role="dialog" aria-modal="true" onClick={onClose}>
            <div 
                className="bg-slate-50 dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Assistant</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-slate-300 dark:border-slate-700 flex-shrink-0 bg-slate-100 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Ask a question..."
                            className="flex-grow p-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
                             aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ChatBot;