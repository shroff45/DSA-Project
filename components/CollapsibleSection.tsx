import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpen: controlledIsOpen, onToggle }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const handleToggle = () => {
        const newState = !isOpen;
        if (onToggle) {
            onToggle(newState);
        }
        if (!isControlled) {
            setInternalIsOpen(newState);
        }
    };

    return (
        <div className="mb-6">
            <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2 flex justify-between items-center">
                <span>{title}</span>
                <button
                    onClick={handleToggle}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`collapsible-content-${title.replace(/\s+/g, '-')}`}
                >
                    {isOpen ? 'Hide' : 'Show'}
                </button>
            </h4>
            {isOpen && (
                <div 
                    id={`collapsible-content-${title.replace(/\s+/g, '-')}`}
                    className="mt-2"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;
