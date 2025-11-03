import React from 'react';
import { AlgorithmSuggestion } from '../types';
import AlgorithmCard from './AlgorithmCard';

interface SavedAlgorithmsListProps {
  savedAlgorithms: AlgorithmSuggestion[];
  onToggleSave: (suggestion: AlgorithmSuggestion) => void;
}

const SavedAlgorithmsList: React.FC<SavedAlgorithmsListProps> = ({ savedAlgorithms, onToggleSave }) => {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
        Your Saved Algorithms
      </h2>
      {savedAlgorithms.length > 0 ? (
        <div>
          {savedAlgorithms.map((suggestion, index) => (
            <AlgorithmCard
              key={`${suggestion.algorithmName}-${index}`}
              suggestion={suggestion}
              onToggleSave={onToggleSave}
              isSaved={true} // Items in this list are always saved
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-800 dark:text-slate-100">No saved algorithms</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
                Click the star icon on an algorithm card to save it for later.
            </p>
        </div>
      )}
    </div>
  );
};

export default SavedAlgorithmsList;
