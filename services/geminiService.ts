
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartEstimate(area: number, wantsSalt: boolean) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Giv en kort vurdering af en snerydningsopgave på ${area} m2. Brugeren vil ${wantsSalt ? 'gerne' : 'ikke'} have saltet.
      Svar i JSON format med felter: "estimatedMinutes" (nummer), "difficulty" (lav, middel, høj), og "proTip" (en kort tekst på dansk).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedMinutes: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            proTip: { type: Type.STRING }
          },
          required: ["estimatedMinutes", "difficulty", "proTip"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini error:", error);
    return null;
  }
}
