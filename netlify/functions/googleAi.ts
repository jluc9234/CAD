// netlify/functions/googleAi.ts
import { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { DATE_CATEGORIES } from "../../constants";
import type { LocalIdea, LocalEvent, DateSuggestion, BudgetOption, DressCodeOption } from "../../types";
import { DateCategory } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.SECRET_GOOGLE_AI_KEY! });

export const handler: Handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const action: string = body.action;

    let result: any;

    switch (action) {
      case "enhanceDescription":
        {
          const description: string = body.description || "";
          const prompt = `You are a creative and witty dating assistant. Enhance the following date description to make it sound more engaging, romantic, and appealing. Keep it concise (2-3 sentences) and exciting.
Original description: "${description}"
Enhanced description:`;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          result = response.text.trim();
        }
        break;

      case "generateDateIdea":
        {
          const keywords: string = body.keywords || "";
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a creative date idea based on these keywords: "${keywords}". Provide a title, a short description (2 sentences), and a potential location (city or specific place).`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                },
              },
            },
          });
          result = JSON.parse(response.text);
        }
        break;

      case "categorizeDate":
        {
          const title: string = body.title || "";
          const description: string = body.description || "";
          const prompt = `Categorize the following date idea into one of these categories: ${DATE_CATEGORIES.join(
            ", "
          )}.
Title: "${title}"
Description: "${description}"
Category:`;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          const category = response.text.trim() as DateCategory;
          result = DATE_CATEGORIES.includes(category)
            ? category
            : DateCategory.Uncategorized;
        }
        break;

      case "generateIcebreaker":
        {
          const name: string = body.name || "Friend";
          const prompt = `Create a short, fun, and charming icebreaker message to send to a new match named ${name}.`;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          result = response.text.trim();
        }
        break;

      case "enhanceBio":
        {
          const bio: string = body.bio || "";
          const prompt = `You are a witty and charming profile writer. Enhance the following user bio to make it more engaging and interesting, while keeping the original spirit. Keep it under 50 words.
Original bio: "${bio}"
Enhanced bio:`;
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          result = response.text.trim();
        }
        break;

      case "getLocalDateIdeas":
        {
          const location: string = body.location || "";
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `List 2 unique and romantic date spots or ideas in ${location}.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    idea: { type: Type.STRING },
                  },
                },
              },
            },
          });
          result = JSON.parse(response.text);
        }
        break;

      case "getLocalEvents":
        {
          const location: string = body.location || "";
          const date: string = body.date || "";
          const formattedDate = new Date(date).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Suggest 2 plausible local events (like concerts, festivals, farmers markets, etc.) happening in ${location} on or around ${formattedDate}. Be creative if no real events are known.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    eventName: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                },
              },
            },
          });
          result = JSON.parse(response.text);
        }
        break;

      case "generateDateSuggestions":
        {
          const criteria = body;
          const promptParts = ["Suggest 2 creative date ideas."];
          if (criteria.title) promptParts.push(`Related to the title: "${criteria.title}".`);
          if (criteria.location) promptParts.push(`Happening in or near: ${criteria.location}.`);
          if (criteria.date) promptParts.push(
            `Scheduled for around: ${new Date(criteria.date).toLocaleDateString()}.`
          );
          if (criteria.category && criteria.category !== DateCategory.Uncategorized)
            promptParts.push(`The category is: ${criteria.category}.`);
          if (criteria.budget && criteria.budget !== "Not Set")
            promptParts.push(`The budget is: ${criteria.budget}.`);
          if (criteria.dressCode && criteria.dressCode !== "Not Set")
            promptParts.push(`The dress code is: ${criteria.dressCode}.`);

          const prompt = promptParts.join(" ");
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                },
              },
            },
          });
          result = JSON.parse(response.text);
        }
        break;

      case "generateBackgroundImage":
        {
          const promptText: string = body.prompt || "";
          const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-001",
            prompt: `Generate a serene and beautiful background image for a dating app profile based on the theme: "${promptText}". The image should be abstract or a landscape, and not contain people. Make it visually appealing and calming.`,
            config: {
              numberOfImages: 1,
              outputMimeType: "image/jpeg",
              aspectRatio: "1:1",
            },
          });
          if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            result = `data:image/jpeg;base64,${base64ImageBytes}`;
          } else {
            result = null;
          }
        }
        break;

      default:
        result = { message: "Invalid action" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error: any) {
    console.error("Error in GoogleAI function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
