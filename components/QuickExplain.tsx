import React, { useState, useEffect, useCallback } from 'react';
import { getQuickExplanation } from '../services/geminiService';

interface QuickExplainProps {
    algorithmName: string;
    initialQuery?: string;
}

const QuickExplain: React.FC<QuickExplainProps> = ({ algorithmName, initialQuery }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAsk = useCallback(async (queryToAsk: string) => {
        if (!queryToAsk.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnswer('');
        try {
            const result = await getQuickExplanation(algorithmName, queryToAsk);
            setAnswer(result);
        } catch (err) {
            setError('Sorry, I couldn\'t get an explanation. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [algorithmName]);

    // Effect to handle externally triggered questions (e.g., from flowchart)
    useEffect(() => {
        if (initialQuery) {
            setQuestion(initialQuery);
            handleAsk(initialQuery);
        }
    }, [initialQuery, handleAsk]);

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-md border border-slate-300 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`Ask about ${algorithmName}...`}
                    className="flex-grow p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk(question)}
                />
                <button
                    onClick={() => handleAsk(question)}
                    disabled={isLoading || !question.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900/50 focus:ring-cyan-500 transition-colors"
                >
                    {isLoading ? 'Asking...' : 'Ask'}
                </button>
            </div>
            {isLoading && (
                 <div className="text-center p-4 text-slate-500 dark:text-slate-400">
                    Getting a quick explanation...
                </div>
            )}
            {error && (
                <div className="mt-3 p-3 text-sm text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600/50 rounded-md">
                    {error}
                </div>
            )}
            {answer && (
                <div className="mt-3 p-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-md">
                   <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
                </div>
            )}
        </div>
    );
};

export default QuickExplain;
