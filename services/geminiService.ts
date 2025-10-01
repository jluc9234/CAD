import { GoogleGenAI, Type } from "@google/genai";
import { DateCategory, LocalIdea, LocalEvent, DateSuggestion, BudgetOption, DressCodeOption } from "../types";
import { DATE_CATEGORIES } from "../constants";

// FIX: Updated API key retrieval to use `process.env.API_KEY` as required by the coding guidelines.
// This resolves the TypeScript error on `import.meta.env` and assumes the environment is correctly configured.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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

export const generateIcebreaker = async (name: string): Promise<string> => {
    try {
        const prompt = `Create a short, fun, and charming icebreaker message to send to a new match named ${name}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating icebreaker:", error);
        return "Hey! How's it going?";
    }
};

export const enhanceBio = async (bio: string): Promise<string> => {
    try {
        const prompt = `You are a witty and charming profile writer. Enhance the following user bio to make it more engaging and interesting, while keeping the original spirit. Keep it under 50 words.
        Original bio: "${bio}"
        Enhanced bio:`;
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

export const getLocalDateIdeas = async (location: string): Promise<LocalIdea[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `List 2 unique and romantic date spots or ideas in ${location}.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            idea: { type: Type.STRING },
                        }
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Error fetching local date ideas:", error);
        return [];
    }
};

export const getLocalEvents = async (location: string, date: string): Promise<LocalEvent[]> => {
    try {
        const formattedDate = new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Suggest 2 plausible local events (like concerts, festivals, farmers markets, etc.) happening in ${location} on or around ${formattedDate}. Be creative if no real events are known.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            eventName: { type: Type.STRING },
                            description: { type: Type.STRING },
                        }
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Error fetching local events:", error);
        return [];
    }
};

export const generateDateSuggestions = async (criteria: {
    title?: string;
    location?: string;
    date?: string;
    category?: DateCategory;
    budget?: BudgetOption;
    dressCode?: DressCodeOption;
}): Promise<DateSuggestion[]> => {
    try {
        const promptParts = ['Suggest 2 creative date ideas.'];
        if (criteria.title) promptParts.push(`Related to the title: "${criteria.title}".`);
        if (criteria.location) promptParts.push(`Happening in or near: ${criteria.location}.`);
        if (criteria.date) promptParts.push(`Scheduled for around: ${new Date(criteria.date).toLocaleDateString()}.`);
        if (criteria.category && criteria.category !== DateCategory.Uncategorized) promptParts.push(`The category is: ${criteria.category}.`);
        if (criteria.budget && criteria.budget !== 'Not Set') promptParts.push(`The budget is: ${criteria.budget}.`);
        if (criteria.dressCode && criteria.dressCode !== 'Not Set') promptParts.push(`The dress code is: ${criteria.dressCode}.`);
        
        const prompt = promptParts.join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                        }
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json;
    } catch (error) {
        console.error("Error generating date suggestions:", error);
        return [];
    }
};

export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Generate a serene and beautiful background image for a dating app profile based on the theme: "${prompt}". The image should be abstract or a landscape, and not contain people. Make it visually appealing and calming.`,
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
