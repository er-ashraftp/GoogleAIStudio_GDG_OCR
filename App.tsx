import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { TransactionSummary } from './components/TransactionSummary';
import { ProcessingProgress } from './components/ProcessingProgress';
import { extractTransactionsFromStatement } from './services/geminiService';
import { convertFileToGeminiParts } from './utils/fileUtils';
import type { Transaction } from './types';
import type { Part } from '@google/genai';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState({
    total: 0,
    completed: 0,
    currentFile: '',
  });

  const handleFileProcess = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setTransactions([]);
    setProcessingState({ total: files.length, completed: 0, currentFile: '' });

    try {
      const allTransactions: Transaction[] = [];
      for (const file of files) {
        setProcessingState(prev => ({ ...prev, currentFile: file.name }));

        let parts: Part[];
        try {
          parts = await convertFileToGeminiParts(file);
        } catch (fileError: any) {
          console.error(`Skipping file ${file.name} due to a conversion error:`, fileError);
          setProcessingState(prev => ({ ...prev, completed: prev.completed + 1 }));
          continue; // Skip this file and move to the next
        }

        if (parts.length === 0) {
          console.warn(`No processable content found in ${file.name}.`);
          setProcessingState(prev => ({ ...prev, completed: prev.completed + 1 }));
          continue;
        }

        const extractedData = await extractTransactionsFromStatement(parts);
        const transactionsWithFileName = extractedData.map(t => ({
          ...t,
          fileName: file.name,
        }));

        allTransactions.push(...transactionsWithFileName);
        setProcessingState(prev => ({ ...prev, completed: prev.completed + 1 }));
      }

      // Sort all transactions from all files together by date
      allTransactions.sort((a, b) => a.date.localeCompare(b.date));
      setTransactions(allTransactions);

    } catch (err: any) {
      setError(`Failed to process the statement(s). ${err.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
      setProcessingState({ total: 0, completed: 0, currentFile: '' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            Bank Statement OCR
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Extract transactions from your bank statements with Gemini AI.
          </p>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 max-w-5xl mx-auto">
            <FileUpload onFileSelect={handleFileProcess} disabled={isLoading} />

            {isLoading && (
              <ProcessingProgress
                total={processingState.total}
                completed={processingState.completed}
                currentFile={processingState.currentFile}
              />
            )}

            {error && (
              <div className="mt-8 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            )}

            {transactions.length > 0 && !isLoading && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                  Transaction Summary &amp; Details
                </h2>
                <TransactionSummary transactions={transactions} />
                <TransactionTable transactions={transactions} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
