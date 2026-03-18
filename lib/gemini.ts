import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) {
    // In development/preview, this might be missing if not set in secrets
    // But the platform usually injects it.
    console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const MODELS = {
  flash: "gemini-flash-latest",
  pro: "gemini-3.1-pro-preview",
};
