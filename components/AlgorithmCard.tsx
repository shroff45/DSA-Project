import React, { useEffect, useState } from 'react';
import { AlgorithmSuggestion } from '../types';
import ComplexityChart from './ComplexityChart';
import { useTheme } from '../contexts/ThemeContext';
import InteractiveCodeEditor from './InteractiveCodeEditor';
import CollapsibleSection from './CollapsibleSection';
import QuickExplain from './QuickExplain';
import GroundedSearch from './GroundedSearch';

// Declare Mermaid on the window object to satisfy TypeScript
declare global {
    interface Window {
        mermaid: any;
    }
}

interface AlgorithmCardProps {
    suggestion: AlgorithmSuggestion;
    onToggleSave: (suggestion: AlgorithmSuggestion) => void;
    isSaved: boolean;
}

const getDifficultyStyles = (difficulty: 'Easy' | 'Medium' | 'Hard' | string | undefined) => {
    switch (difficulty) {
        case 'Easy':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-600/50';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600/50';
        case 'Hard':
            return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600/50';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600/50';
    }
};


const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ suggestion, onToggleSave, isSaved }) => {
    const { theme } = useTheme();
    const flowchartId = `mermaid-flowchart-${suggestion.algorithmName.replace(/\s+/g, '-')}-${Math.random()}`;
    const [isQuickExplainOpen, setIsQuickExplainOpen] = useState(false);
    const [quickExplainInitialQuery, setQuickExplainInitialQuery] = useState('');

    useEffect(() => {
        if (typeof window.mermaid !== 'undefined' && suggestion.mermaidFlowchart) {
             try {
                const mermaidContainer = document.getElementById(flowchartId);
                // Check if container exists and is visible before rendering
                if (mermaidContainer && mermaidContainer.offsetParent !== null) { 
                    window.mermaid.initialize({
                        startOnLoad: false,
                        theme: theme === 'dark' ? 'dark' : 'default',
                        flowchart: { useMaxWidth: true }
                    });
                    
                    const preElement = mermaidContainer.querySelector('pre.mermaid');
                    if (preElement && !preElement.hasAttribute('data-processed')) {
                         window.mermaid.run({
                            nodes: [preElement],
                            suppressErrors: true,
                        }).then(() => {
                            // Make flowchart nodes interactive
                             const svgElement = mermaidContainer.querySelector('svg');
                             if(svgElement) {
                                const nodes = svgElement.querySelectorAll('.node');
                                nodes.forEach(node => {
                                    (node as HTMLElement).style.cursor = 'pointer';
                                    node.addEventListener('click', () => {
                                        const nodeLabel = node.textContent?.trim();
                                        if (nodeLabel) {
                                           setQuickExplainInitialQuery(`Explain this step of ${suggestion.algorithmName}: "${nodeLabel}"`);
                                           setIsQuickExplainOpen(true);
                                        }
                                    });
                                });
                             }
                        });
                    }
                }
            } catch (e) {
                console.error("Mermaid rendering error:", e);
                 const mermaidContainer = document.getElementById(flowchartId);
                 if(mermaidContainer) {
                    mermaidContainer.innerHTML = `<p class="text-red-500 dark:text-red-400">Error rendering flowchart.</p>`;
                 }
            }
        }
    }, [suggestion.mermaidFlowchart, theme, flowchartId, isQuickExplainOpen, suggestion.algorithmName]);


    return (
        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 w-full mb-6 backdrop-blur-lg transition-all hover:border-indigo-400/50 dark:hover:border-indigo-600/50">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{suggestion.algorithmName}</h3>
                <button
                    onClick={() => onToggleSave(suggestion)}
                    className="p-2 -mr-2 -mt-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900/60 focus:ring-indigo-500 transition-colors"
                    aria-label={isSaved ? 'Unsave algorithm' : 'Save algorithm'}
                >
                    {isSaved ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    )}
                </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
                {suggestion.difficulty && (
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getDifficultyStyles(suggestion.difficulty)}`}>
                        {suggestion.difficulty}
                    </span>
                )}
                {suggestion.dataStructures.map(ds => (
                    <span key={ds} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">{ds}</span>
                ))}
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-4">{suggestion.description}</p>

            <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Complexity Analysis</h4>
                <ComplexityChart 
                    timeComplexity={suggestion.timeComplexity}
                    spaceComplexity={suggestion.spaceComplexity}
                />
            </div>
            
            <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Why this fits your problem:</h4>
                <p className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-md border border-slate-300 dark:border-slate-700">{suggestion.useCase}</p>
            </div>
            
            <CollapsibleSection title="Visual Flowchart" isOpen={isQuickExplainOpen} onToggle={setIsQuickExplainOpen}>
                 <div className="p-4 bg-white dark:bg-slate-900/70 rounded-md border border-slate-300 dark:border-slate-700 flex justify-center items-center overflow-x-auto min-h-[100px]">
                    {suggestion.mermaidFlowchart ? (
                        <div id={flowchartId} className="w-full text-center text-slate-800 dark:text-slate-200">
                             {/* This pre tag will be processed by the useEffect hook */}
                             <pre className="mermaid" style={{ all: 'unset' }}>
                                {suggestion.mermaidFlowchart}
                             </pre>
                             <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Click a step in the flowchart to learn more about it.</p>
                         </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">No flowchart available for this algorithm.</p>
                    )}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Quick Explain" isOpen={isQuickExplainOpen} onToggle={setIsQuickExplainOpen}>
                <QuickExplain 
                    algorithmName={suggestion.algorithmName} 
                    initialQuery={quickExplainInitialQuery}
                />
            </CollapsibleSection>
            
            <CollapsibleSection title="Find Real-World Examples">
                <GroundedSearch algorithmName={suggestion.algorithmName} />
            </CollapsibleSection>
            
            <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">C Code Sandbox</h4>
                <InteractiveCodeEditor initialCode={suggestion.cCodeSnippet} />
            </div>

            {suggestion.relatedAlgorithms && suggestion.relatedAlgorithms.length > 0 && (
                <div>
                    <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Related Algorithms to Explore</h4>
                    <div className="space-y-2">
                        {suggestion.relatedAlgorithms.map((related, index) => (
                            <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-300 dark:border-slate-700">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{related.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{related.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmCard;