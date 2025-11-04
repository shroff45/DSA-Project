import React from 'react';
import { TimeComplexity } from '../types';

interface ComplexityChartProps {
    timeComplexity: TimeComplexity;
    spaceComplexity: string;
}

interface Rating {
    width: number;
    color: string;
}

const getComplexityRating = (complexity: string): Rating => {
    const sanitized = complexity.toLowerCase().replace(/[\s\(\)]/g, '');

    if (sanitized.includes('1')) return { width: 10, color: 'bg-green-500' };
    if (sanitized.includes('logn')) return { width: 25, color: 'bg-green-400' };
    if (sanitized.includes('nlogn')) return { width: 65, color: 'bg-orange-400' };
    if (sanitized.includes('sqrt(n)') || sanitized.includes('sqrtn')) return { width: 40, color: 'bg-yellow-400' };
    if (sanitized.includes('n') && !sanitized.includes('^')) return { width: 50, color: 'bg-yellow-500' };
    if (sanitized.includes('n^2')) return { width: 80, color: 'bg-red-400' };
    if (sanitized.includes('n^3')) return { width: 90, color: 'bg-red-500' };
    if (sanitized.includes('2^n')) return { width: 95, color: 'bg-red-600' };
    if (sanitized.includes('n!')) return { width: 100, color: 'bg-red-700' };

    return { width: 50, color: 'bg-gray-400' }; // Default for unknown cases
};

const ComplexityBar: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const { width, color } = getComplexityRating(value);

    return (
        <div className="mb-3 last:mb-0">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-300">{value}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                    className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${width}%` }}
                    role="progressbar"
                    aria-valuenow={width}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label} complexity: ${value}`}
                ></div>
            </div>
        </div>
    );
};

const Legend: React.FC = () => {
    const legendItems = [
        { color: 'bg-green-500', text: 'Excellent: O(1), O(log n)' },
        { color: 'bg-yellow-500', text: 'Good: O(n), O(√n)' },
        { color: 'bg-orange-400', text: 'Fair: O(n log n)' },
        { color: 'bg-red-500', text: 'Poor: O(n²), O(2ⁿ), O(n!)' },
    ];

    return (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
             <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Complexity Legend</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {legendItems.map(item => (
                    <div key={item.text} className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${item.color}`}></span>
                        <span className="text-slate-500 dark:text-slate-400">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ComplexityChart: React.FC<ComplexityChartProps> = ({ timeComplexity, spaceComplexity }) => {
    return (
        <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-md border border-slate-300 dark:border-slate-700">
            <div>
                <ComplexityBar label="Best Time" value={timeComplexity.best} />
                <ComplexityBar label="Average Time" value={timeComplexity.average} />
                <ComplexityBar label="Worst Time" value={timeComplexity.worst} />
                <ComplexityBar label="Space" value={spaceComplexity} />
            </div>
            <Legend />
        </div>
    );
};

export default ComplexityChart;