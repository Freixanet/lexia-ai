import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChatMessage, ModelType, Source } from "../types";

// Initialize the client. API_KEY is expected to be in the environment.
// In a real app, we might handle the lack of a key more gracefully in the UI.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLexiaResponseStream = async (
  history: ChatMessage[],
  newMessage: string,
  modelName: ModelType = ModelType.FAST,
  useSearch: boolean = true,
  onChunk: (text: string, sources?: Source[]) => void
): Promise<void> => {
  if (!apiKey) {
    onChunk("Error: API Key is missing. Please ensure process.env.API_KEY is set.", []);
    return;
  }

  try {
    // Construct the chat history for the model
    // Note: The GenAI SDK 'sendMessage' manages history in a Chat session object, 
    // but for stateless functional usage or simply passing previous context manually:
    // We will use the 'generateContentStream' with a list of messages (contents) for more control 
    // or use a transient chat session if we want the SDK to manage it.
    // Here, let's use a Chat session to simplify history management.

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      
      // Extract Text
      const text = c.text;

      // Extract Grounding (Sources)
      let sources: Source[] | undefined = undefined;
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (groundingChunks) {
        sources = groundingChunks
          .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
          .filter((s: any) => s !== null) as Source[];
      }

      if (text || sources) {
        onChunk(text || '', sources);
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    onChunk(`\n\n[System Error: Unable to generate response. ${error.message || 'Unknown error'}]`, undefined);
  }
};