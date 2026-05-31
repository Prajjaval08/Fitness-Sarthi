import Anthropic from "@anthropic-ai/sdk"
export async function getAICoachResponse(messages:{role:"user"|"assistant";content:string}[]) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured")
  const client = new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY})
  return client.messages.stream({model:"claude-sonnet-4-20250514",max_tokens:1024,system:"You are Fitness Saarthi, a warm and practical bilingual fitness coach for Indian users. Give concise, safe advice and recommend professional care for medical concerns.",messages})
}
