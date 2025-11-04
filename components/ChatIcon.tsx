import React from 'react';

interface ChatIconProps {
    onClick: () => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-110"
            aria-label="Open AI Assistant"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>
    );
};

export default ChatIcon;