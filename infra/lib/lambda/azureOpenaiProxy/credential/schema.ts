import { z } from "zod";

// ******************************
// Azure OpenAI Proxy 
// ******************************
export const AzureOpenAIProxyCredentialBodySchema = z.object({
  sessionId: z.string(),
})
export type AzureOpenAIProxyCredentialBody = z.infer<typeof AzureOpenAIProxyCredentialBodySchema>;