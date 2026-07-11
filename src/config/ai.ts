export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const AI_MODEL = process.env.EXPO_PUBLIC_OPENROUTER_MODEL?.trim();

export function isAiConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim());
}
