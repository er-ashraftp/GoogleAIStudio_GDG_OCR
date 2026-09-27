import React from 'react';
import type { Transaction } from '../types';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    colorClass: string;
}> = ({ icon, label, value, colorClass }) => (
    <div className="bg-gray-100/50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center shadow-sm ring-1 ring-black ring-opacity-5">
        <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return null;
  }

  const totalTransactions = transactions.length;
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpending = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      <StatCard
        icon={<ReceiptIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
        label="Total Transactions"
        value={totalTransactions.toString()}
        colorClass="bg-gray-200 dark:bg-gray-600"
      />
      <StatCard
        icon={<ArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
        label="Total Income"
        value={formatCurrency(totalIncome)}
        colorClass="bg-green-100 dark:bg-green-900/40"
      />
      <StatCard
        icon={<ArrowDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />}
        label="Total Spending"
        value={formatCurrency(totalSpending)}
        colorClass="bg-red-100 dark:bg-red-900/40"
      />
    </div>
  );
};