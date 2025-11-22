import { GoogleGenAI } from '@google/genai';
// Client no longer accesses API keys directly. Use server API instead.

// Fetch insights from server API instead of client SDK
// Example: await fetch('/api/generate-insight', { method: 'POST', body: JSON.stringify({ ... }) })

export async function GenerativeAI(transactions) {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `based on this transactions ${transactions} Give a summary of how i am spending the funds.`,
    });

    return response

}