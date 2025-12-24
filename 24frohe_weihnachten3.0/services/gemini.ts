
import { GoogleGenAI, Type } from "@google/genai";
import { ChristmasWish } from "../types";

export const generateChristmasWishList = async (): Promise<ChristmasWish[]> => {
  // Always use a named parameter for the API key and use the environment variable directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a list of 8 unique, heartwarming Christmas wishes. 
    Each wish must be bilingual, including both German and Chinese versions.
    The response should be a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Short title in both German and Chinese (e.g. 'Frohe Weihnachten | 圣诞快乐')" },
            message: { type: Type.STRING, description: "The full wish message containing both German and Chinese text." },
            language: { type: Type.STRING, description: "Should be 'German & Chinese'" }
          },
          required: ["title", "message", "language"],
          propertyOrdering: ["title", "message", "language"]
        }
      }
    }
  });

  try {
    // Access the text property directly (not as a method) as per the latest SDK.
    const jsonStr = response.text || '[]';
    const wishes = JSON.parse(jsonStr.trim());
    return wishes;
  } catch (e) {
    return [{
      title: "Frohe Weihnachten | 圣诞快乐",
      message: "Möge dein Herz von Wärme und Freude erfüllt sein. 愿你的心中充满温暖与快乐。",
      language: "German & Chinese"
    }];
  }
};
