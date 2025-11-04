import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { translateCode } from '../services/geminiService';

// TypeScript declarations for libraries loaded via script tags
declare global {
  interface Window {
    CodeMirror: any;
  }
}

interface InteractiveCodeEditorProps {
  initialCode: string;
}

const supportedLanguages: Record<string, string> = {
  'C': 'text/x-csrc',
  'C++': 'text/x-c++src',
  'Java': 'text/x-java',
  'Python': 'text/x-python',
  'JavaScript': 'text/javascript',
  'Go': 'text/x-go',
  'Rust': 'text/x-rustsrc',
};

const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({ initialCode }) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null);

  const [code, setCode] = useState(initialCode);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const [selectedLanguage, setSelectedLanguage] = useState('C');
  const [codeSnippets, setCodeSnippets] = useState<Record<string, string>>({ 'C': initialCode });
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);


  useEffect(() => {
    if (!textareaRef.current || typeof window.CodeMirror === 'undefined') {
      return;
    }

    const editor = window.CodeMirror.fromTextArea(textareaRef.current, {
      mode: supportedLanguages['C'],
      theme: theme === 'dark' ? 'material-darker' : 'default',
      lineNumbers: true,
      lineWrapping: true,
    });

    editor.setValue(initialCode);
    editor.on('change', (instance) => {
      setCode(instance.getValue());
    });
    
    editorRef.current = editor;

    return () => {
      editor.toTextArea();
    };
  }, [initialCode]);

  useEffect(() => {
    if (editorRef.current) {
        const newTheme = theme === 'dark' ? 'material-darker' : 'default';
        editorRef.current.setOption('theme', newTheme);
    }
  }, [theme]);
  
  const handleCopyCode = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Failed to copy code:', err));
  };
  
  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setTranslationError(null);

    const updateEditor = (newCode: string, newMode: string) => {
        if (editorRef.current) {
            editorRef.current.setValue(newCode);
            editorRef.current.setOption('mode', newMode);
        }
    };

    if (codeSnippets[newLanguage]) {
        updateEditor(codeSnippets[newLanguage], supportedLanguages[newLanguage]);
        return;
    }

    setIsTranslating(true);
    try {
        const translatedCode = await translateCode(initialCode, newLanguage);
        setCodeSnippets(prev => ({ ...prev, [newLanguage]: translatedCode }));
        updateEditor(translatedCode, supportedLanguages[newLanguage]);
    } catch (err) {
        console.error(err);
        setTranslationError(`Failed to translate to ${newLanguage}.`);
    } finally {
        setIsTranslating(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 shadow-sm backdrop-blur-lg">
      <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Language:
            </label>
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isTranslating}
                className="py-1 px-2 text-sm rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
                {Object.keys(supportedLanguages).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
          </div>
          {translationError && <p className="text-xs text-red-500 dark:text-red-400">{translationError}</p>}
      </div>

      <div className="editor-container relative">
        {isTranslating && (
             <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                 <svg className="animate-spin h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Translating to {selectedLanguage}...</p>
            </div>
        )}
        <textarea ref={textareaRef} defaultValue={initialCode} style={{ display: 'none' }} />
      </div>

      <div className="flex items-center justify-end p-2 bg-slate-100 dark:bg-slate-800/70 border-t border-slate-300 dark:border-slate-700">
          <button
            onClick={handleCopyCode}
            className="flex items-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
          >
              {isCopied ? (
                  <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                  </>
              ) : (
                  <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Code</span>
                  </>
              )}
          </button>
      </div>
    </div>
  );
};

export default InteractiveCodeEditor;