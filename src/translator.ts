import {
  createOpenAICompatible,
  type OpenAICompatibleLanguageModelChatOptions,
} from '@ai-sdk/openai-compatible';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import type { TranslationResult, TranslatorConfig } from './types.ts';

const translationSchema = z.object({
  translation: z.string().describe('The English translation of the input text'),
});

export async function translateToEnglish(
  text: string,
  config: TranslatorConfig,
): Promise<TranslationResult> {
  try {
    const provider = createOpenAICompatible({
      name: 'translator',
      baseURL: `${config.baseUrl}/v1`,
      apiKey: config.apiKey,
      supportsStructuredOutputs: true,
    });

    const { output: result } = await generateText({
      model: provider(config.model),
      output: Output.object({
        schema: translationSchema,
      }),
      system:
        'Translate the following text to English. If the text is already in English, output it unchanged (as is).',
      prompt: text,
      maxRetries: 3,
      providerOptions: {
        openai: {
          textVerbosity: 'low',
        } satisfies OpenAICompatibleLanguageModelChatOptions,
      },
    });

    if (!result) throw new Error('No content in response');

    return { translated: true, text: result.translation };
  } catch (err) {
    console.warn('[translateToEnglish] error:', err);
    return { translated: false, text };
  }
}
