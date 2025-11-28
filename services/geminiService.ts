import { ChatMessage, ModelType, Source } from "../types";

export const generateLexiaResponseStream = async (
  history: ChatMessage[],
  newMessage: string,
  modelName: ModelType = ModelType.FAST,
  useSearch: boolean = true,
  onChunk: (text: string, sources?: Source[]) => void
): Promise<void> => {
  try {
    // Call our own API (Serverless Function)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Since the serverless function returns the full text at once (no streaming),
    // we just call onChunk once with the full text.
    if (data.text) {
      onChunk(data.text, undefined);
    } else {
      onChunk("Error: No response from AI.", undefined);
    }

  } catch (error: any) {
    console.error("API Error:", error);
    onChunk(`\n\n[System Error: Unable to connect to server. ${error.message || 'Unknown error'}]`, undefined);
  }
};