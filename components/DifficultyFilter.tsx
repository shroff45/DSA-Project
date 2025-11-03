import React from 'react';

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

interface DifficultyFilterProps {
    activeFilter: Difficulty;
    onFilterChange: (filter: Difficulty) => void;
}

const filters: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

const getButtonStyles = (isActive: boolean) => {
    return isActive
        ? 'bg-cyan-600 text-white border-cyan-600 dark:border-cyan-500'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
};

const DifficultyFilter: React.FC<DifficultyFilterProps> = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="flex-shrink-0">
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm" role="group" aria-label="Filter by difficulty">
                {filters.map((filter, index) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`px-4 py-[0.68rem] text-sm font-semibold border-l border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:z-10 transition-colors ${getButtonStyles(activeFilter === filter)} ${index === 0 ? '!border-l-0' : ''}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DifficultyFilter;
