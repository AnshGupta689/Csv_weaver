
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  fileName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, fileName }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors
        ${isDragging ? 'border-teal-400 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}
    >
      <div className="text-center">
        <UploadIcon className="mx-auto h-12 w-12 text-gray-500"/>
        <p className="mt-2 text-sm text-gray-400">
          <span className="font-semibold text-teal-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">CSV file up to 50,000+ records</p>
        {fileName && <p className="mt-2 text-sm font-medium text-teal-300">{fileName}</p>}
      </div>
      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
    </label>
  );
};

export default FileUpload;
