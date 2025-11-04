import React from 'react';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
    message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isModel = message.role === 'model';

    // Simple markdown to HTML for bold and code
    const formattedText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">$1</code>'); // Inline code
    };

    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
            <div
                className={`max-w-prose px-4 py-3 rounded-2xl shadow ${
                    isModel
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                        : 'bg-indigo-600 text-white rounded-br-none'
                }`}
            >
                <p 
                    className="text-sm" 
                    dangerouslySetInnerHTML={{ __html: formattedText(message.text) }}
                />
            </div>
        </div>
    );
};

export default ChatBubble;