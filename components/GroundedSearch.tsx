import React, { useState } from 'react';
import { getGroundedResponse } from '../services/geminiService';
import { GroundingChunk } from '../types';

interface GroundedSearchProps {
    algorithmName: string;
}

const GroundedSearch: React.FC<GroundedSearchProps> = ({ algorithmName }) => {
    const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wasSearched, setWasSearched] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setWasSearched(true);
        try {
            const response = await getGroundedResponse(algorithmName);
            setResult(response);
        } catch (err) {
            setError('Sorry, I couldn\'t fetch real-world examples. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!wasSearched) {
        return (
             <div className="text-center p-4">
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800/60 focus:ring-indigo-500 transition-colors"
                >
                    Search for recent examples
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-300 dark:border-slate-700">
            {isLoading && (
                 <div className="text-center p-4 text-slate-500 dark:text-slate-400">
                    Searching the web for the latest info...
                </div>
            )}
            {error && (
                <div className="p-3 text-sm text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600/50 rounded-md">
                    {error}
                </div>
            )}
            {result && (
                <div>
                    <div className="p-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-md">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{result.text}</p>
                    </div>
                    {result.sources && result.sources.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Sources:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {result.sources.filter(s => s.web).map((source, index) => (
                                    <li key={index} className="text-sm">
                                        <a 
                                            href={source.web?.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroundedSearch;