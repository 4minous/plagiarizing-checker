
import React, { useState, useCallback } from 'react';
import TextInput from './components/TextInput';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { checkPlagiarism } from './services/geminiService';
import { PlagiarismResult } from './types';
import { SearchIcon, GlobeIcon } from './components/icons';

const App: React.FC = () => {
  const [sourceText, setSourceText] = useState<string>('');
  const [textToCheck, setTextToCheck] = useState<string>('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const handleCheckPlagiarism = useCallback(async () => {
    const isReady = useWebSearch ? textToCheck.trim() : (sourceText.trim() && textToCheck.trim());
    if (!isReady) {
      setError(useWebSearch ? 'Please provide the text to check against the web.' : 'Please provide both a source text and a text to check.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkPlagiarism(sourceText, textToCheck, useWebSearch);
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, textToCheck, useWebSearch]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Aminous plagiarizing checker
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            created by Aminu Abdullahi
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 mb-6" style={{ minHeight: '50vh' }}>
          <div className="md:w-1/2 h-full min-h-[400px] md:min-h-0 flex flex-col">
            <TextInput
              id="source-text"
              title="Source Text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={useWebSearch ? "Source text is optional when searching the web..." : "Paste the original text here..."}
              disabled={isLoading}
            />
          </div>
          <div className="md:w-1/2 h-full min-h-[400px] md:min-h-0 flex flex-col">
            <TextInput
              id="text-to-check"
              title="Text to Check"
              value={textToCheck}
              onChange={(e) => setTextToCheck(e.target.value)}
              placeholder="Paste the text you want to check for plagiarism here..."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 my-6">
            <label htmlFor="web-search-toggle" className="flex items-center cursor-pointer select-none">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="web-search-toggle" 
                        className="sr-only" 
                        checked={useWebSearch}
                        onChange={() => setUseWebSearch(!useWebSearch)}
                        disabled={isLoading}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${useWebSearch ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${useWebSearch ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-300 font-medium flex items-center gap-2">
                    <GlobeIcon className="w-5 h-5" />
                    Check Against the Web
                </div>
            </label>
            <button
                onClick={handleCheckPlagiarism}
                disabled={isLoading || !textToCheck.trim() || (!useWebSearch && !sourceText.trim())}
                className="flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-800"
            >
                {isLoading ? (
                <>
                    <Loader />
                    <span>Analyzing...</span>
                </>
                ) : (
                <>
                    <SearchIcon className="w-6 h-6" />
                    <span>Check for Plagiarism</span>
                </>
                )}
            </button>
        </div>

        {error && (
          <div className="my-6 max-w-3xl mx-auto p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="mt-12">
            <ResultDisplay result={result} />
          </div>
        )}
      </main>
      <footer className="text-center text-gray-500 mt-12 py-4">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
