import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// TypeScript declarations for libraries loaded via script tags
declare global {
  interface Window {
    TCC: any;
    CodeMirror: any;
  }
}

interface InteractiveCodeEditorProps {
  initialCode: string;
}

// NEW: Type for structured compiler messages
interface CompilerMessage {
  line: number;
  type: 'error' | 'warning';
  message: string;
}

const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({ initialCode }) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<any>(null); // To hold the CodeMirror instance

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [compilerMessages, setCompilerMessages] = useState<CompilerMessage[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!textareaRef.current || typeof window.CodeMirror === 'undefined') {
      return;
    }

    const editor = window.CodeMirror.fromTextArea(textareaRef.current, {
      mode: 'text/x-csrc',
      theme: theme === 'dark' ? 'material-darker' : 'default',
      lineNumbers: true,
      lineWrapping: true,
    });

    editor.setValue(initialCode);
    editor.on('change', (instance) => {
      setCode(instance.getValue());
    });
    
    editorRef.current = editor;

    // Cleanup function to remove the editor instance
    return () => {
      editor.toTextArea();
    };
  }, [initialCode]); // Re-initialize if the initial code changes

  // Effect to update theme
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption('theme', theme === 'dark' ? 'material-darker' : 'default');
    }
  }, [theme]);
  
  // NEW: Parses TCC's stderr for errors and warnings
  const parseTccOutput = (stderr: string): CompilerMessage[] => {
      const messages: CompilerMessage[] = [];
      // Regex to capture line number, type (error/warning), and message from TCC output
      const regex = /<stdin>:(\d+):\s+(warning|error):\s+(.*)/g;
      let match;
      while ((match = regex.exec(stderr)) !== null) {
        messages.push({
          line: parseInt(match[1], 10),
          type: match[2] as 'warning' | 'error',
          message: match[3].trim(),
        });
      }
      return messages;
  };

  const handleRunCode = async () => {
    if (typeof window.TCC === 'undefined') {
        setOutput("Error: C compiler (TCC.js) not loaded.");
        return;
    }
    setIsRunning(true);
    setOutput('');
    setCompilerMessages([]); // Reset messages on new run

    // Use a timeout to allow the UI to update before the potentially blocking WASM call
    setTimeout(async () => {
        try {
            const tcc = new window.TCC();
            const exitCode = tcc.run(code);
            const stderr = tcc.stderr || '';
            const stdout = tcc.stdout || '';

            const messages = parseTccOutput(stderr);
            setCompilerMessages(messages);
            
            if (exitCode === 0) {
                 // Success, possibly with warnings
                setOutput(stdout || '(No output to stdout)');
            } else {
                // Compilation or runtime error
                const hasErrors = messages.some(m => m.type === 'error');
                if (hasErrors) {
                    setOutput('Compilation failed. See messages below.');
                } else {
                    // This could be a runtime error or un-parsable compiler error
                    setOutput(`Execution failed with exit code ${exitCode}.\n\n--- STDERR ---\n${stderr}`);
                }
            }
        } catch (e: unknown) {
            const error = e as Error;
            console.error('TCC Execution Error:', error);
            setOutput(`An unexpected error occurred during execution:\n${error.message}`);
        } finally {
            setIsRunning(false);
        }
    }, 50);
  };

  const handleCopyCode = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Failed to copy code:', err));
  };
  
  // NEW: Jumps to the line of code for a given message
  const handleMessageClick = (line: number) => {
    if (editorRef.current) {
      // CodeMirror lines are 0-indexed
      editorRef.current.setCursor({ line: line - 1, ch: 0 });
      editorRef.current.focus();
    }
  };


  return (
    <div className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 shadow-sm">
      <div className="editor-container">
        {/* The textarea is hidden and replaced by CodeMirror */}
        <textarea ref={textareaRef} defaultValue={initialCode} style={{ display: 'none' }} />
      </div>

      <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-300 dark:border-slate-600">
        <div className="flex items-center gap-2">
           <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors"
            >
                {isRunning ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                )}
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors"
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
                        <span>Copy</span>
                    </>
                )}
            </button>
        </div>
      </div>
      
      {/* NEW: Dedicated panel for compiler errors and warnings */}
      {compilerMessages.length > 0 && (
        <div className="compiler-messages p-4 border-t border-slate-300 dark:border-slate-600">
          <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Compiler Messages:</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {compilerMessages.map((msg, index) => {
              const isError = msg.type === 'error';
              return (
                <div
                  key={index}
                  onClick={() => handleMessageClick(msg.line)}
                  className={`flex items-start p-2 rounded-md cursor-pointer transition-colors ${
                    isError
                      ? 'bg-red-100/50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40'
                      : 'bg-yellow-100/50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isError ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-semibold ${
                      isError ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      Line {msg.line}: <span className="capitalize">{msg.type}</span>
                    </p>
                    <p className={`text-sm font-mono ${
                      isError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {output && (
        <div className="output-container p-4 border-t border-slate-300 dark:border-slate-600">
            <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Output:</h5>
            <pre className="text-sm text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/70 p-3 rounded-md overflow-x-auto whitespace-pre-wrap font-mono">
                {output}
            </pre>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodeEditor;
