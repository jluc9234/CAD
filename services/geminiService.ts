import { GoogleGenAI, Type } from "@google/genai";
import { DateCategory, LocalIdea, LocalEvent, DateSuggestion, BudgetOption, DressCodeOption, Message, User } from "../types";
import { DATE_CATEGORIES } from "../constants";

// FIX: Switched from Vite-specific import.meta.env to process.env.API_KEY to align with guidelines and fix TypeScript errors.
const API_KEY = process.env.API_KEY;


if (!API_KEY) {
  // This provides a more helpful error message if the variable is missing.
  // The user must set API_KEY in their deployment environment (e.g., Netlify).
  throw new Error("API_KEY environment variable not set. Please check your deployment settings.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const enhanceDescription = async (description: string): Promise<string> => {
  try {
    const prompt = `You are a creative and witty dating assistant. Enhance the following date description to make it sound more engaging, romantic, and appealing. Keep it concise (2-3 sentences) and exciting.
    Original description: "${description}"
    Enhanced description:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing description:", error);
    return `Error: Could not enhance description. Original: ${description}`;
  }
};

export const generateDateIdea = async (keywords: string): Promise<{ title: string; description: string; location?: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
        const json = JSON.parse(response.text);
        return {
            title: json.title || 'AI Generated Idea',
            description: json.description || 'No description provided.',
            location: json.location || undefined,
        }
    } catch (error) {
        console.error("Error generating date idea:", error);
        return {
            title: "Error Generating Idea",
            description: "Could not generate a date idea. Please try different keywords.",
        }
    }
};

export const categorizeDate = async (title: string, description: string): Promise<DateCategory> => {
    try {
        const prompt = `Categorize the following date idea into one of these categories: ${DATE_CATEGORIES.join(', ')}.
        Title: "${title}"
        Description: "${description}"
        Category:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const category = response.text.trim() as DateCategory;
        if (DATE_CATEGORIES.includes(category)) {
            return category;
        }
        return DateCategory.Uncategorized;
    } catch (error) {
        console.error("Error categorizing date:", error);
        return DateCategory.Uncategorized;
    }
};

// FIX: Implemented missing function to fetch local date ideas.
export const getLocalDateIdeas = async (location: string): Promise<LocalIdea[]> => {
  try {
    const prompt = `Based on the location "${location}", generate a list of 3 unique and interesting date ideas. For each idea, provide a "name" (a catchy title) and an "idea" (a short, one-sentence description).`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
            required: ['name', 'idea'],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Error getting local date ideas for ${location}:`, error);
    return [];
  }
};

// FIX: Implemented missing function to fetch local events.
export const getLocalEvents = async (location: string, date: string): Promise<LocalEvent[]> => {
  try {
    const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `List 3 real or plausible public events happening in or around "${location}" on or around the date ${formattedDate}. Examples could be concerts, festivals, or special museum exhibits. For each event, provide an "eventName" and a "description".`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
            required: ['eventName', 'description'],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Error getting local events for ${location}:`, error);
    return [];
  }
};

// FIX: Implemented missing function to generate date suggestions.
export const generateDateSuggestions = async (params: {
    title?: string;
    location?: string;
    date?: string;
    category?: DateCategory;
    budget?: BudgetOption;
    dressCode?: DressCodeOption;
}): Promise<DateSuggestion[]> => {
    try {
        let prompt = "Generate 3 creative date suggestions based on the following details. Each suggestion should have a 'title' and a 'description'.\n";
        if (params.title) prompt += `Title context: "${params.title}"\n`;
        if (params.location) prompt += `Location: "${params.location}"\n`;
        if (params.date) prompt += `Date: ${new Date(params.date).toLocaleDateString()}\n`;
        if (params.category && params.category !== DateCategory.Uncategorized) prompt += `Category: ${params.category}\n`;
        if (params.budget && params.budget !== 'Not Set') prompt += `Budget: ${params.budget}\n`;
        if (params.dressCode && params.dressCode !== 'Not Set') prompt += `Dress Code: ${params.dressCode}\n`;

        if (Object.values(params).every(v => !v || v === 'Not Set' || v === DateCategory.Uncategorized)) {
            prompt = "Generate 3 creative and random date suggestions. Each suggestion should have a 'title' and a 'description'.";
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
                        required: ['title', 'description']
                    }
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating date suggestions:", error);
        return [];
    }
};

// FIX: Implemented missing function to get conversation suggestions.
export const getConversationSuggestions = async (messages: Message[], currentUser: User, otherUser: User): Promise<string[]> => {
    try {
        const conversationHistory = messages.map(msg => {
            const speaker = msg.senderId === currentUser.id ? 'Me' : otherUser.name;
            return `${speaker}: ${msg.text}`;
        }).join('\n');

        const prompt = `You are a friendly and helpful dating assistant. Based on the conversation history below, suggest 3 creative, engaging, and relevant conversation starters or replies for "Me". The goal is to keep the conversation flowing and get to know the other person better.

Conversation History:
${conversationHistory}

My Profile Interests: ${currentUser.interests.join(', ')}
Their Profile Interests: ${otherUser.interests.join(', ')}

Suggest 3 short (1-2 sentences) replies for "Me" as a JSON array of strings:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 3 conversation suggestions as strings."
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error getting conversation suggestions:", error);
        return ["Sorry, I couldn't think of anything right now. Try again later!"];
    }
};

// FIX: Implemented missing function to enhance a user's bio.
export const enhanceBio = async (bio: string): Promise<string> => {
    try {
        const prompt = `You are a witty and charming profile writer for a dating app. Enhance the following user bio to make it more engaging, intriguing, and show more personality. Keep it a similar length but add a bit of flair or a fun question at the end.
Original Bio: "${bio}"
Enhanced Bio:`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing bio:", error);
        return bio;
    }
};

// FIX: Implemented missing function to generate a background image.
export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A vibrant, abstract, and aesthetically pleasing background image for a dating app profile. The style should be modern and energetic, without being distracting. Keywords: ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating background image:", error);
        return null;
    }
};
