import type { Plugin } from '@opencode-ai/plugin';
import { isEnglish } from './detector.ts';
import { extractCodeBlocks, restoreCodeBlocks } from './extractor.ts';
import { translateToEnglish } from './translator.ts';
import type { TranslatorConfig } from './types.ts';

export const InputTranslatorPlugin: Plugin = async ({ client }) => {
  const apiKey = process.env.TRANSLATOR_API_KEY;
  const baseUrl = process.env.TRANSLATOR_BASE_URL;
  const model = process.env.TRANSLATOR_MODEL ?? 'gpt-5-nano-2025-08-07';

  if (!apiKey || !baseUrl) {
    await client.app.log({
      body: {
        service: 'input-translator',
        level: 'warn',
        message:
          'Missing TRANSLATOR_API_KEY or TRANSLATOR_BASE_URL. Input Translator Plugin is disabled.',
      },
    });
    return {};
  }

  const config: TranslatorConfig = { apiKey, baseUrl, model };

  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      for (const message of output.messages) {
        if (message.info.role !== 'user') continue;

        for (const part of message.parts) {
          if (part.type !== 'text') continue;
          if (part.text.trim().length === 0) continue;
          if (part.synthetic === true || part.ignored === true) continue;
          if (part.metadata?.__translated === true) continue;
          if (isEnglish(part.text)) continue;

          const { prose, blocks } = extractCodeBlocks(part.text);
          if (prose.trim().length === 0) continue;

          const result = await translateToEnglish(prose, config);
          if (result.translated) {
            part.text = restoreCodeBlocks(result.text, blocks);
            part.metadata = { ...part.metadata, __translated: true };
          }
        }
      }
    },
  };
};

export default InputTranslatorPlugin;
