import { GoogleGenAI } from '@google/genai';

export const runtime = "nodejs";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req) {
  if (!GOOGLE_API_KEY) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Server env GOOGLE_API_KEY is not set',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
  const { transactions } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: `Analyze the following transactions: ${JSON.stringify(transactions)}`,
    });

    // Ensure response.text is available
    if (!response.text) {
      throw new Error('AI response text is empty');
    }

    return new Response(JSON.stringify({
      status: 'success',
      insight: response.text,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error("AI Error:", err.message || err);
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message || 'Failed to generate insight',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
