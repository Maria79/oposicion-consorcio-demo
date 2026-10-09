import OpenAI from "openai";

// Delay construction until a real (non-demo) question-generation request.
// The demo never contacts OpenAI and does not require an API key to start.
let client: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for question generation");
  client ??= new OpenAI({ apiKey });
  return client;
}
