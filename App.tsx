import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getAlgorithmAdvice, startChat } from './services/geminiService';
import { AdvisorResponse, AlgorithmSuggestion } from './types';
import ProblemInput from './components/ProblemInput';
import AlgorithmCard from './components/AlgorithmCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ThemeToggleButton from './components/ThemeToggleButton';
import SavedAlgorithmsList from './components/SavedAlgorithmsList';
import DifficultyFilter from './components/DifficultyFilter';
import ChatIcon from './components/ChatIcon';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
    const [problemDescription, setProblemDescription] = useState('');
    const [advisorResponse, setAdvisorResponse] = useState<AdvisorResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [savedAlgorithms, setSavedAlgorithms] = useState<AlgorithmSuggestion[]>([]);
    const [showSavedList, setShowSavedList] = useState(false);
    const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Initialize the chat service when the app loads
    useEffect(() => {
        startChat();
    }, []);

    useEffect(() => {
        try {
          const stored = localStorage.getItem('savedAlgorithms');
          if (stored) {
            setSavedAlgorithms(JSON.parse(stored));
          }
        } catch (error) {
          console.error("Failed to parse saved algorithms from localStorage", error);
          setSavedAlgorithms([]);
        }
    }, []);

    const handleToggleSave = useCallback((suggestion: AlgorithmSuggestion) => {
        setSavedAlgorithms(prevSaved => {
            const isAlreadySaved = prevSaved.some(s => s.algorithmName === suggestion.algorithmName);
            let updatedSaved;
            if (isAlreadySaved) {
                updatedSaved = prevSaved.filter(s => s.algorithmName !== suggestion.algorithmName);
            } else {
                updatedSaved = [...prevSaved, suggestion];
            }
            localStorage.setItem('savedAlgorithms', JSON.stringify(updatedSaved));
            return updatedSaved;
        });
    }, []);

    const isAlgorithmSaved = (suggestion: AlgorithmSuggestion) => {
        return savedAlgorithms.some(s => s.algorithmName === suggestion.algorithmName);
    };

    const handleSubmit = useCallback(async (problem: string) => {
        if (!problem.trim()) return;

        setShowSavedList(false);
        setIsLoading(true);
        setError(null);
        setAdvisorResponse(null);
        setSearchQuery(''); 
        setDifficultyFilter('All');
        try {
            const response = await getAlgorithmAdvice(problem);
            setAdvisorResponse(response);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleExampleClick = (exampleProblem: string) => {
        setProblemDescription(exampleProblem);
        handleSubmit(exampleProblem);
    };

    const WelcomeMessage: React.FC<{onExampleClick: (problem: string) => void}> = ({ onExampleClick }) => {
      const examples = [
        { label: "Shortest Path in a Maze", prompt: "I need to find the shortest path from a start point to an end point in a 2D grid representing a maze. Some cells are walls and cannot be entered. What's the best algorithm for this in C?"},
        { label: "Autocomplete Suggestions", prompt: "How can I build an efficient autocomplete system in C? It should suggest words as a user types. I'm expecting to have a large dictionary of words."},
        { label: "Thread-Safe Queue", prompt: "Provide C code for a thread-safe queue data structure. It should support multiple producer and consumer threads safely."},
      ];

      return (
      <div className="text-center text-slate-500 dark:text-slate-400 max-w-3xl mt-8">
        <h2 className="text-2xl text-slate-700 dark:text-slate-200 font-semibold mb-2">Welcome to the AI Algorithm Advisor</h2>
        <p className="mb-3">
          Stuck on a problem for your DSA project? Describe it in the box above. The AI will analyze your request and suggest the most effective data structures and algorithms, complete with complexity analysis and runnable C code snippets.
        </p>
         <p className="text-sm italic bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-300 dark:border-slate-700">
          <strong>Pro Tip:</strong> For the best results, provide as much context as you can. Mention constraints (e.g., "memory is limited"), data types (e.g., "sorting an array of custom structs"), and the scale of the problem (e.g., "up to a million items").
        </p>
        <div className="mt-6">
          <h3 className="text-slate-600 dark:text-slate-400 font-semibold mb-3">Or try an example:</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((ex) => (
              <button 
                key={ex.label}
                onClick={() => onExampleClick(ex.prompt)}
                className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700/50 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-200"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
    }

    const filteredRecommendations = useMemo(() => {
        if (!advisorResponse?.recommendations) {
            return [];
        }

        let recommendations = advisorResponse.recommendations;

        // 1. Filter by text query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            recommendations = recommendations.filter(suggestion =>
                suggestion.algorithmName.toLowerCase().includes(query) ||
                suggestion.description.toLowerCase().includes(query) ||
                suggestion.dataStructures.some(ds => ds.toLowerCase().includes(query))
            );
        }

        // 2. Filter by difficulty
        if (difficultyFilter !== 'All') {
            recommendations = recommendations.filter(suggestion => suggestion.difficulty === difficultyFilter);
        }

        return recommendations;
    }, [advisorResponse, searchQuery, difficultyFilter]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300">
            <header className="w-full max-w-3xl text-center mb-8 relative">
                <div className="absolute top-0 right-0 flex items-center space-x-2">
                     <button
                        onClick={() => setShowSavedList(!showSavedList)}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors relative"
                        aria-label={showSavedList ? 'Back to search' : 'View saved algorithms'}
                        >
                        {savedAlgorithms.length > 0 && !showSavedList && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-white text-xs font-bold">
                            {savedAlgorithms.length}
                            </span>
                        )}
                        {showSavedList ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        )}
                    </button>
                    <ThemeToggleButton />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600 dark:from-cyan-400 dark:to-teal-500">
                    AI Algorithm Advisor
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Your C Language DSA Companion for VIT Vellore</p>
            </header>

            {showSavedList ? (
                <SavedAlgorithmsList
                    savedAlgorithms={savedAlgorithms}
                    onToggleSave={handleToggleSave}
                />
            ) : (
                <main className="w-full flex flex-col items-center">
                    <ProblemInput 
                        onSubmit={() => handleSubmit(problemDescription)} 
                        isLoading={isLoading}
                        value={problemDescription}
                        onChange={setProblemDescription}
                    />

                    {isLoading && <div className="mt-8"><LoadingSpinner /></div>}
                    
                    {error && <div className="mt-8 w-full flex justify-center"><ErrorDisplay message={error} /></div>}

                    {advisorResponse && (
                        <div className="w-full max-w-3xl mt-8">
                            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-300 dark:border-slate-700 mb-6">
                                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">AI Summary & Recommendation</h2>
                                <p className="text-slate-600 dark:text-slate-300">{advisorResponse.summary}</p>
                            </div>
                            
                            {advisorResponse.recommendations.length > 0 && (
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Filter by keyword..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full p-3 pl-10 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <DifficultyFilter activeFilter={difficultyFilter} onFilterChange={setDifficultyFilter} />
                                </div>
                            )}

                            {filteredRecommendations.length > 0 ? (
                                filteredRecommendations.map((suggestion, index) => (
                                    <AlgorithmCard 
                                        key={index} 
                                        suggestion={suggestion} 
                                        onToggleSave={handleToggleSave}
                                        isSaved={isAlgorithmSaved(suggestion)}
                                    />
                                ))
                            ) : advisorResponse.recommendations.length > 0 ? (
                                <div className="text-center p-8 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg">
                                    <p className="text-slate-500 dark:text-slate-400">No matching algorithms found for your filters.</p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!isLoading && !advisorResponse && !error && <WelcomeMessage onExampleClick={handleExampleClick} />}
                </main>
            )}
             {/* Chatbot Feature */}
            <ChatIcon onClick={() => setIsChatOpen(true)} />
            <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            <footer className="text-center text-slate-500 mt-auto pt-8">
                <p>&copy; {new Date().getFullYear()} AI Algorithm Advisor. Built for DSA Project.</p>
            </footer>
        </div>
    );
};

export default App;
