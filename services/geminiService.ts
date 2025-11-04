
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import `WebSource` to use it for explicit typing.
import { PlagiarismResult, WebSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    overallSimilarityPercentage: {
      type: Type.NUMBER,
      description: "A numerical percentage (0-100) representing the overall similarity."
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the plagiarism findings."
    },
    similarities: {
      type: Type.ARRAY,
      description: "A list of specific text matches found.",
      items: {
        type: Type.OBJECT,
        properties: {
          sourceText: {
            type: Type.STRING,
            description: "The original text snippet from the source document."
          },
          checkedText: {
            type: Type.STRING,
            description: "The matching text snippet from the document being checked."
          },
          explanation: {
            type: Type.STRING,
            description: "An explanation of the similarity."
          }
        },
        required: ["sourceText", "checkedText", "explanation"]
      }
    }
  },
  required: ["overallSimilarityPercentage", "summary", "similarities"]
};


export const checkPlagiarism = async (sourceText: string, textToCheck: string, useWebSearch: boolean): Promise<PlagiarismResult> => {
    try {
        if (useWebSearch) {
            const prompt = `
                You are a highly accurate plagiarism detection tool with access to Google Search.
                Your task is to analyze the "Text to Check".

                1. Use your search capabilities to find any published online sources that contain similar or identical text.
                2. If a "Source Text" is provided, also compare the "Text to Check" against it. If "Source Text" is empty, focus solely on web sources.
                3. Identify all instances of plagiarism, including direct copies and heavily paraphrased sentences from any source you find (web or provided).

                Your final output MUST be a single JSON object wrapped in \`\`\`json ... \`\`\`. Do not include any other text outside of the JSON block.

                The JSON object must conform to this structure:
                - 'overallSimilarityPercentage': A number between 0 and 100, considering all sources.
                - 'summary': A concise summary of your findings.
                - 'similarities': An array where each object represents a specific instance of plagiarism. Each object must contain:
                  - 'sourceText': The text snippet from the original source (either the provided "Source Text" or a web source).
                  - 'checkedText': The corresponding plagiarized snippet from the "Text to Check".
                  - 'explanation': A brief explanation, mentioning the source if it was from the web.

                Here are the texts:

                ---
                **Source Text:**
                ${sourceText.trim() || "Not provided."}
                ---
                **Text to Check:**
                ${textToCheck}
                ---
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                    temperature: 0.2,
                },
            });

            const text = response.text;
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            
            if (!jsonMatch || !jsonMatch[1]) {
                 console.error("Raw response text:", text);
                 throw new Error("Could not parse JSON response from the model when searching the web.");
            }

            const result: Omit<PlagiarismResult, 'webSources'> = JSON.parse(jsonMatch[1]);

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            // FIX: Explicitly type `webSources` and use non-null assertions to ensure correct type inference. This helps correctly type `uniqueSources` later.
            const webSources: WebSource[] = groundingChunks
                .filter(chunk => chunk.web && chunk.web.uri)
                .map(chunk => ({
                    uri: chunk.web!.uri!,
                    title: chunk.web!.title || chunk.web!.uri!,
                }));
            
            const uniqueSources = Array.from(new Map(webSources.map(item => [item.uri, item])).values());

            return { ...result, webSources: uniqueSources };

        } else {
            // Original logic for text-to-text comparison
            const prompt = `
                You are a highly accurate plagiarism detection tool. Your task is to analyze two pieces of text: a "Source Text" and a "Text to Check".

                Compare them meticulously and identify all instances of plagiarism, including direct copies and heavily paraphrased sentences.

                Your output must be in JSON format.

                Based on your analysis, provide:
                1.  An 'overallSimilarityPercentage' as a number between 0 and 100.
                2.  A concise 'summary' of your findings.
                3.  An array called 'similarities', where each object represents a specific instance of plagiarism. Each object in the array must contain:
                    - 'sourceText': The exact text snippet from the "Source Text".
                    - 'checkedText': The corresponding plagiarized snippet from the "Text to Check".
                    - 'explanation': A brief explanation of why this is considered a similarity.

                Here are the texts:

                ---
                **Source Text:**
                ${sourceText}
                ---
                **Text to Check:**
                ${textToCheck}
                ---
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.2,
                },
            });

            const jsonString = response.text.trim();
            const result = JSON.parse(jsonString);
            
            if (typeof result.overallSimilarityPercentage !== 'number' || !Array.isArray(result.similarities)) {
                throw new Error("Invalid response format from API.");
            }
            
            return result as PlagiarismResult;
        }

    } catch (error) {
        console.error("Error checking plagiarism:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to check plagiarism: ${error.message}`);
        }
        throw new Error("An unknown error occurred during plagiarism check.");
    }
};
