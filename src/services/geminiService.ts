import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SafetyAnalysis {
  status: 'safe' | 'warning' | 'dangerous' | 'unknown';
  score: number; // 0-100
  summary: string;
  details: string;
  threats: string[];
  recommendation: string;
}

export async function analyzeUrl(url: string): Promise<SafetyAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the safety of this URL: ${url}. 
      Focus on whether it is safe to download files or software from this link.
      Check for:
      1. Phishing or scam reputation.
      2. Malware or virus distribution history.
      3. Suspicious redirects.
      4. Domain age and SSL certificate validity (if possible).
      5. Community reports or blacklists.
      
      Return the analysis in a structured format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            status: { type: "STRING", enum: ["safe", "warning", "dangerous", "unknown"] },
            score: { type: "NUMBER", description: "Safety score from 0 (dangerous) to 100 (safe)" },
            summary: { type: "STRING" },
            details: { type: "STRING", description: "Markdown formatted detailed analysis" },
            threats: { type: "ARRAY", items: { type: "STRING" } },
            recommendation: { type: "STRING" }
          },
          required: ["status", "score", "summary", "details", "threats", "recommendation"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as SafetyAnalysis;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return {
      status: 'unknown',
      score: 0,
      summary: "Failed to analyze the URL.",
      details: "An error occurred during the analysis process.",
      threats: [],
      recommendation: "Do not click this link until you can verify it through other means."
    };
  }
}
