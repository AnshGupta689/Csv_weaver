
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 flex items-center">
        <svg className="w-10 h-10 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        <div>
            <h1 className="text-3xl font-bold text-white">CSV Weaver</h1>
            <p className="text-sm text-gray-400">Weave your CSV data into structured JSON with ease.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
