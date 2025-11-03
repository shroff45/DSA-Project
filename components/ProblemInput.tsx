import React from 'react';

interface ProblemInputProps {
    onSubmit: () => void;
    isLoading: boolean;
    value: string;
    onChange: (value: string) => void;
}

const MAX_CHARS = 4000;

const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit, isLoading, value, onChange }) => {
    const charCount = value.length;
    const isOverLimit = charCount > MAX_CHARS;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim() && !isLoading && !isOverLimit) {
            onSubmit();
        }
    };

    const charCountColor = isOverLimit 
        ? 'text-red-500 font-medium' 
        : charCount > MAX_CHARS * 0.9 
        ? 'text-yellow-500' 
        : 'text-slate-400 dark:text-slate-500';

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe your problem here... e.g., 'How do I implement a binary search tree in C?' or 'I need C code for sorting an array of structs'"
                    className="w-full h-40 p-4 pr-12 pb-10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none transition-shadow"
                    disabled={isLoading}
                    aria-describedby="char-count"
                />
                <div className="absolute bottom-4 left-4 text-sm" id="char-count">
                    <span className={charCountColor}>{charCount} / {MAX_CHARS}</span>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !value.trim() || isOverLimit}
                    className="absolute bottom-4 right-4 p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all duration-200"
                    aria-label="Get Advice"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
             {isOverLimit && 
                <p className="text-red-500 text-sm mt-2 text-center">
                    Your problem description is too long. Please shorten it to under {MAX_CHARS} characters.
                </p>
            }
        </form>
    );
};

export default ProblemInput;
