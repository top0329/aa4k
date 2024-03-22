/**
 * OpenAI APIKey不正
 */
export class InvalidOpenAiApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOpenAiApiKeyError';
  }
}
