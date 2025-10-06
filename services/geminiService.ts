// src/services/geminiService.ts

import type { LocalIdea, LocalEvent, DateSuggestion, DateCategory, BudgetOption, DressCodeOption } from "../types";

export type GeminiAction =
  | "enhanceDescription"
  | "generateDateIdea"
  | "categorizeDate"
  | "generateIcebreaker"
  | "enhanceBio"
  | "getLocalDateIdeas"
  | "getLocalEvents"
  | "generateDateSuggestions"
  | "generateBackgroundImage";

interface GeminiRequest {
  action: GeminiAction;
  [key: string]: any;
}

interface GeminiResponse<T = any> {
  result: T;
}

const callGoogleAI = async <T = any>(payload: GeminiRequest): Promise<T> => {
  try {
    const res = await fetch("/.netlify/functions/googleAi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: GeminiResponse<T> = await res.json();
    return data.result;
  } catch (error) {
    console.error("Error calling Google AI function:", error);
    throw error;
  }
};

// --- Exported frontend functions ---
export const enhanceDescription = async (description: string) =>
  callGoogleAI<string>({ action: "enhanceDescription", description });

export const generateDateIdea = async (keywords: string) =>
  callGoogleAI<{ title: string; description: string; location?: string }>({
    action: "generateDateIdea",
    keywords,
  });

export const categorizeDate = async (title: string, description: string) =>
  callGoogleAI<string>({
    action: "categorizeDate",
    title,
    description,
  });

export const generateIcebreaker = async (name: string) =>
  callGoogleAI<string>({ action: "generateIcebreaker", name });

export const enhanceBio = async (bio: string) =>
  callGoogleAI<string>({ action: "enhanceBio", bio });

export const getLocalDateIdeas = async (location: string) =>
  callGoogleAI<LocalIdea[]>({ action: "getLocalDateIdeas", location });

export const getLocalEvents = async (location: string, date: string) =>
  callGoogleAI<LocalEvent[]>({ action: "getLocalEvents", location, date });

export const generateDateSuggestions = async (criteria: {
  title?: string;
  location?: string;
  date?: string;
  category?: DateCategory;
  budget?: BudgetOption;
  dressCode?: DressCodeOption;
}) =>
  callGoogleAI<DateSuggestion[]>({
    action: "generateDateSuggestions",
    ...criteria,
  });

export const generateBackgroundImage = async (prompt: string) =>
  callGoogleAI<string | null>({ action: "generateBackgroundImage", prompt });
