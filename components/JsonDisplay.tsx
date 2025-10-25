import React, { useState } from 'react';
import { ClipboardIcon } from './Icons';

interface JsonDisplayProps {
  jsonData: string;
}

const JsonDisplay: React.FC<JsonDisplayProps> = ({ jsonData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!jsonData) return;
    navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        {jsonData && (
           <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-xs font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
          >
            <ClipboardIcon className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        )}
      </div>

      {!jsonData ? (
        <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-md">
          <div className="text-center text-gray-600">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="mt-2 text-sm">Transformed JSON will appear here</p>
          </div>
        </div>
      ) : (
        <pre className="flex-grow bg-gray-900 text-sm text-gray-300 p-4 rounded-md overflow-auto">
          <code>{jsonData}</code>
        </pre>
      )}
    </>
  );
};

export default JsonDisplay;