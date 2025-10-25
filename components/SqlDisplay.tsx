import React, { useState } from 'react';
import { ClipboardIcon } from './Icons';

interface SqlDisplayProps {
  sqlData: string;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ sqlData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if(!sqlData) return;
    navigator.clipboard.writeText(sqlData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        {sqlData && (
           <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
          >
            <ClipboardIcon className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy SQL'}
          </button>
        )}
      </div>

      {!sqlData ? (
        <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md">
          <div className="text-center text-gray-600">
             <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="mt-2 text-sm">Generated SQL will appear here</p>
          </div>
        </div>
      ) : (
        <pre className="flex-grow bg-gray-900 text-sm text-teal-300 p-4 rounded-md overflow-auto">
          <code>{sqlData}</code>
        </pre>
      )}
    </>
  );
};

export default SqlDisplay;
