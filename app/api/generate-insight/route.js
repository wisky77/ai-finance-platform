import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req) {
  // Validate env
  if (!GOOGLE_API_KEY) {
    return new Response(
      JSON.stringify({ status: "error", message: "Server env GOOGLE_API_KEY is not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse and validate body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ status: "error", message: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { transactions } = body || {};
  if (!Array.isArray(transactions)) {
    return new Response(
      JSON.stringify({ status: "error", message: "Body must include an array 'transactions'" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze the following transactions and provide concise insights and suggestions in markdown.\n\nTransactions: ${JSON.stringify(
      transactions
    )}`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";

    if (!text) {
      throw new Error("Empty response from AI model");
    }

    return new Response(
      JSON.stringify({ status: "success", insight: text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err?.message || "Failed to generate insight";
    const isUserError = /invalid|missing|unsupported|400|unauthorized|permission/.test(
      msg.toLowerCase()
    );
    return new Response(
      JSON.stringify({ status: "error", message: msg }),
      { status: isUserError ? 400 : 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
