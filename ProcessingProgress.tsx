import React from 'react';
import { Loader } from './Loader';

interface ProcessingProgressProps {
    total: number;
    completed: number;
    currentFile: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ total, completed, currentFile }) => {
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    const currentFileNumber = Math.min(completed + 1, total);

    const progressText = currentFile 
        ? `Processing ${currentFileNumber} of ${total}: ${currentFile}` 
        : 'Initializing file processing...';

    return (
        <div className="mt-8 text-center px-4">
            <Loader />
            
            <div className="mt-4 w-full max-w-md mx-auto">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 truncate" title={progressText}>
                    {progressText}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This may take a moment, especially for multi-page documents.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 my-4">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Completed: <strong>{completed}</strong></span>
                    <span>Remaining: <strong>{total - completed}</strong></span>
                    <span>Total: <strong>{total}</strong></span>
                </div>
            </div>
        </div>
    );
};
