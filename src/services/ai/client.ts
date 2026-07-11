import { AI_MODEL, isAiConfigured, OPENROUTER_API_URL } from "@/config/ai";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
};

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

export function extractJsonObject<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new AiServiceError("AI returned an invalid response. Please try again.");
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    throw new AiServiceError("AI returned an invalid response. Please try again.");
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  if (!isAiConfigured()) {
    throw new AiServiceError(
      "OpenRouter API key is missing. Add EXPO_PUBLIC_OPENROUTER_API_KEY to your .env file.",
    );
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://task-management.app",
      "X-Title": "Task Management",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 429) {
      throw new AiServiceError("AI is rate-limited right now. Please try again in a moment.");
    }

    throw new AiServiceError(
      errorText ? `AI request failed (${response.status}).` : `AI request failed (${response.status}).`,
    );
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new AiServiceError("AI returned an empty response. Please try again.");
  }

  return content;
}
