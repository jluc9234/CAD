import { GoogleGenAI, Type } from "@google/genai";
import { DateCategory, LocalIdea, LocalEvent, DateSuggestion, BudgetOption, DressCodeOption, Message, User } from "../types";
import { DATE_CATEGORIES } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
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
        let prompt = "Generate 3 creative date ideas based on the following user-provided details. For each idea, provide a catchy title and a short, appealing description.\n";
        if (criteria.title) prompt += `- A title that includes or is similar to: "${criteria.title}"\n`;
        if (criteria.location) prompt += `- The location is: ${criteria.location}\n`;
        if (criteria.date) prompt += `- The date is on or around: ${new Date(criteria.date).toLocaleDateString()}\n`;
        if (criteria.category && criteria.category !== DateCategory.Uncategorized) prompt += `- The category is: ${criteria.category}\n`;
        if (criteria.budget && criteria.budget !== 'Not Set') prompt += `- The budget is: ${criteria.budget}\n`;
        if (criteria.dressCode && criteria.dressCode !== 'Not Set') prompt += `- The dress code is: ${criteria.dressCode}\n`;

        if(Object.values(criteria).every(val => !val || val === 'Not Set' || val === DateCategory.Uncategorized)) {
            prompt += "- The user hasn't provided any specific details, so generate three diverse and exciting date ideas."
        }

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
        return [
            { title: "Error", description: "Could not generate suggestions at this time. Please try again." }
        ];
    }
};

export const generateBackgroundImage = async (prompt: string): Promise<string | null> => {
    try {
        const fullPrompt = `A beautiful, aesthetic, high-resolution phone wallpaper background based on the theme: "${prompt}". The style should be modern and visually pleasing, suitable for a sleek app background. Avoid text or distracting elements.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
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

export const getConversationSuggestions = async (
    messages: Message[],
    currentUser: User,
    otherUser: User
): Promise<string[]> => {
    try {
        const conversationHistory = messages.map(msg => {
            const senderName = msg.senderId === currentUser.id ? currentUser.name : otherUser.name;
            return `${senderName}: ${msg.text}`;
        }).join('\n');

        const prompt = `You are an AI dating coach and conversation buddy. Your goal is to help a user continue a conversation on a dating app.
        The user you are helping is "${currentUser.name}". They are talking to "${otherUser.name}".

        Here is the conversation history:
        ${conversationHistory.length > 0 ? conversationHistory : "This is the start of the conversation. Help the user send a great first message!"}

        Based on this conversation (and the other user's profile info: interests are [${otherUser.interests.join(', ')}], bio is "${otherUser.bio}"), generate three distinct, engaging, and context-aware suggestions for what "${currentUser.name}" could say next.
        The suggestions should be short, like a text message.
        Provide the output in JSON format as an array of 3 strings.
        Example: ["That's so interesting! What's your favorite part about that?", "Haha, you have a great sense of humor. Speaking of which...", "I noticed you're into ${otherUser.interests[0] || 'something cool'}. Tell me more!"]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });

        const json = JSON.parse(response.text);
        if (Array.isArray(json) && json.every(item => typeof item === 'string')) {
            return json;
        }
        throw new Error("Invalid response format from AI.");

    } catch (error) {
        console.error("Error generating conversation suggestions:", error);
        return ["How's your week going?", "Anything fun planned for the weekend?", "I'm having trouble with my AI, but I'd love to chat!"];
    }
};