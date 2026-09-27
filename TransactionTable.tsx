import React, { useState, useCallback } from 'react';
import type { Transaction } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [copied, setCopied] = useState(false);

  const copyToCSV = useCallback(() => {
    const header = "Date\tDescription\tAmount\tCategory\tNotes\tFileName\n";
    const tsvRows = transactions.map(t => {
      // Sanitize fields to remove tabs and newlines that would break the format
      const description = t.description.replace(/[\n\t]/g, ' ');
      const notes = (t.notes || '').replace(/[\n\t]/g, ' ');
      const fileName = t.fileName || '';
      return [t.date, description, t.amount, t.category, notes, fileName].join('\t');
    });

    const tsvContent = header + tsvRows.join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [transactions]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={copyToCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800 transition-all duration-150"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 mr-2" />
          ) : (
            <CopyIcon className="w-5 h-5 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy to CSV'}
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Name</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((t, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{t.date}</td>
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs">{t.description}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${t.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-xs">{t.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={t.fileName}>{t.fileName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
