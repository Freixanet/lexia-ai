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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      onChunk(chunkText, undefined);
    }

  } catch (error: any) {
    console.error("API Error:", error);
    onChunk(`\n\n[System Error: Unable to connect to server. ${error.message || 'Unknown error'}]`, undefined);
  }
};