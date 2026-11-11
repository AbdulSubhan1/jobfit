import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { createOllama } from "ollama-ai-provider-v2";

type Env = Record<string, string | undefined>;

// One place decides the AI. Switch provider or model with AI_PROVIDER and AI_MODEL; no code change.
const PROVIDERS: Record<string, (env: Env) => (modelId: string) => LanguageModel> = {
  google: (env) => createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY }),
  groq: (env) => createGroq({ apiKey: env.GROQ_API_KEY }),
  openai: (env) => createOpenAI({ apiKey: env.OPENAI_API_KEY }),
  anthropic: (env) => createAnthropic({ apiKey: env.ANTHROPIC_API_KEY }),
  ollama: (env) => createOllama({ baseURL: env.OLLAMA_BASE_URL }),
};

export function getModel(env: Env = process.env): LanguageModel {
  const name = env.AI_PROVIDER ?? "google";
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown AI_PROVIDER "${name}". Use one of: ${Object.keys(PROVIDERS).join(", ")}`);
  if (!env.AI_MODEL) throw new Error("Set AI_MODEL to a model id for the chosen AI_PROVIDER");
  return provider(env)(env.AI_MODEL);
}
