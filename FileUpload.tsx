import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  }, [disabled, onFileSelect]);

  const baseClasses = "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-300";
  const inactiveClasses = "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600";
  const activeClasses = "border-blue-500 bg-blue-100 dark:bg-blue-900/20";
  const disabledClasses = "cursor-not-allowed opacity-50 bg-gray-200 dark:bg-gray-800";

  return (
    <div>
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${disabled ? disabledClasses : isDragging ? activeClasses : inactiveClasses} ${!disabled && 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <UploadIcon className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop files
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PDFs, PNGs, JPGs or GIFs</p>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          disabled={disabled} 
          multiple
        />
      </label>
    </div>
  );
};