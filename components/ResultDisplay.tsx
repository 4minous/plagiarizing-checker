
import React from 'react';
import { PlagiarismResult, Similarity, WebSource } from '../types';
import { GlobeIcon } from './icons';

interface ResultDisplayProps {
  result: PlagiarismResult;
}

const ProgressCircle: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-green-400';
  if (percentage > 25) colorClass = 'text-yellow-400';
  if (percentage > 50) colorClass = 'text-orange-400';
  if (percentage > 75) colorClass = 'text-red-500';

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold ${colorClass}`}>
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

const SimilarityCard: React.FC<{ similarity: Similarity, index: number }> = ({ similarity, index }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 transition-shadow hover:shadow-lg">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">Match #{index + 1}</h4>
        <p className="text-gray-400 italic mb-4">"{similarity.explanation}"</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h5 className="font-bold text-gray-300 mb-2">Source Text</h5>
                <p className="bg-red-900/30 text-red-200 p-3 rounded-md text-sm font-mono">
                    {similarity.sourceText}
                </p>
            </div>
            <div>
                <h5 className="font-bold text-gray-300 mb-2">Checked Text</h5>
                <p className="bg-green-900/30 text-green-200 p-3 rounded-md text-sm font-mono">
                    {similarity.checkedText}
                </p>
            </div>
        </div>
    </div>
);

const WebSourcesDisplay: React.FC<{ sources: WebSource[] }> = ({ sources }) => (
    <div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <GlobeIcon className="w-6 h-6 text-blue-400" />
            Potential Web Sources Found
        </h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6">
            <ul className="space-y-4">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold pt-1">{index + 1}.</span>
                        <div>
                            <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-300 hover:text-blue-200 hover:underline underline-offset-2 transition-colors break-all"
                            >
                                {source.title || source.uri}
                            </a>
                            <p className="text-xs text-gray-500 break-all">{source.uri}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 border-b border-gray-700 pb-8">
          <ProgressCircle percentage={result.overallSimilarityPercentage} />
          <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Analysis Complete</h2>
              <p className="text-lg text-gray-300">Overall Similarity Score</p>
              <p className="text-gray-400 mt-4">{result.summary}</p>
          </div>
      </div>
      
      {result.webSources && result.webSources.length > 0 && (
          <WebSourcesDisplay sources={result.webSources} />
      )}

      <div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Detected Similarities</h3>
        {result.similarities.length > 0 ? (
          <div className="space-y-6">
            {result.similarities.map((sim, index) => (
              <SimilarityCard key={index} similarity={sim} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
            <h4 className="text-lg font-semibold text-gray-200">No Significant Similarities Found</h4>
            <p className="text-gray-400 mt-2">The analysis did not detect any notable overlap between the two texts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
