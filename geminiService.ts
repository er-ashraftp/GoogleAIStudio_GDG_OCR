import { GoogleGenAI, Type } from "@google/genai";
import type { Part } from '@google/genai';
import type { Transaction } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const prompt = `
You are an expert at analyzing bank statements. Your task is to extract all transactions with perfect accuracy, paying special attention to dates.

Follow this multi-step process carefully:
1.  **Identify Statement Period**: Before doing anything else, scan the document to find the statement's period (e.g., "Statement from Dec 15, 2024 to Jan 14, 2025"). This is the most critical step for date accuracy.
2.  **Determine Correct Year**: Use the year(s) from the statement period as the ground truth. Many transaction lines only show the month and day (e.g., 'Dec 16'). You must use the context of the statement period to assign the correct year.
3.  **Handle Year-End Crossover**: This is a common point of error. If a statement period crosses from December to January, transactions listed under December belong to the *earlier* year, and those under January belong to the *later* year. For a statement period of "Dec 15, 2024 - Jan 14, 2025", a transaction on "Dec 16" MUST be "2024-12-16", and a transaction on "Jan 10" MUST be "2025-01-10".
4.  **Extract Transaction Details**: Once you are certain of the date, extract the following for each transaction:
    *   **date**: The full date, strictly formatted as "YYYY-MM-DD".
    *   **description**: The complete, unaltered transaction description.
    *   **amount**: The numeric value. It is absolutely critical that debits/withdrawals are NEGATIVE numbers and credits/deposits are POSITIVE numbers.
    *   **category**: Infer a logical category (e.g., "Groceries", "Salary", "Utilities", "Transportation"). If unsure, use "Miscellaneous".
    *   **notes**: Include any additional details found on the transaction line (like currency exchange rates). If there are no extra details, leave this as an empty string.
5.  **Final Output**: Return a single, clean JSON array of all the transaction objects. Do not include any other text, explanations, or formatting.
`;

const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: "Transaction date in YYYY-MM-DD format.",
            },
            description: {
                type: Type.STRING,
                description: "Concise description of the transaction.",
            },
            amount: {
                type: Type.NUMBER,
                description: "Transaction amount. Crucially, debits must be negative, and credits must be positive.",
            },
            category: {
                type: Type.STRING,
                description: "A suggested category for the transaction (e.g., 'Groceries', 'Salary').",
            },
            notes: {
                type: Type.STRING,
                description: "Any additional notes or details about the transaction.",
            },
        },
        required: ["date", "description", "amount", "category"],
    },
};

export const extractTransactionsFromStatement = async (imageParts: Part[]): Promise<Transaction[]> => {
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [ { text: prompt }, ...imageParts ] },
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    const transactions: Transaction[] = JSON.parse(jsonText);
    
    return transactions;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI model failed to extract transactions. The document might be unclear or in an unsupported format.");
  }
};