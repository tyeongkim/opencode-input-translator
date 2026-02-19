import { afterAll, describe, expect, test } from 'bun:test';
import { translateToEnglish } from '../src/translator.ts';
import type { TranslatorConfig } from '../src/types.ts';

describe('translateToEnglish', () => {
  const servers: Array<{ stop(): void }> = [];

  afterAll(() => {
    for (const s of servers) s.stop();
  });

  function makeConfig(port: number): TranslatorConfig {
    return {
      apiKey: 'test-key',
      baseUrl: `http://localhost:${port}`,
      model: 'test-model',
    };
  }

  test('successful translation', async () => {
    const server = Bun.serve({
      port: 0,
      fetch() {
        return Response.json({
          id: 'test-id',
          object: 'chat.completion',
          model: 'test-model',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify({ translation: 'translated text' }),
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        });
      },
    });
    servers.push(server);

    const result = await translateToEnglish(
      '한국어 텍스트',
      makeConfig(server.port as number),
    );
    expect(result).toEqual({ translated: true, text: 'translated text' });
  });

  test('API error (non-200) returns fail-open', async () => {
    const server = Bun.serve({
      port: 0,
      fetch() {
        return new Response('Internal Server Error', { status: 500 });
      },
    });
    servers.push(server);

    const original = '원본 텍스트';
    const result = await translateToEnglish(
      original,
      makeConfig(server.port as number),
    );
    expect(result).toEqual({ translated: false, text: original });
  }, 30_000);

  test('network error (unreachable) returns fail-open', async () => {
    const original = '네트워크 에러';
    const result = await translateToEnglish(original, {
      apiKey: 'test-key',
      baseUrl: 'http://localhost:1',
      model: 'test-model',
    });
    expect(result).toEqual({ translated: false, text: original });
  }, 30_000);

  test('request body has correct shape', async () => {
    let capturedBody: unknown = null;
    const server = Bun.serve({
      port: 0,
      async fetch(req) {
        capturedBody = await req.json();
        return Response.json({
          id: 'test-id',
          object: 'chat.completion',
          model: 'test-model',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify({ translation: 'ok' }),
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        });
      },
    });
    servers.push(server);

    await translateToEnglish('테스트', makeConfig(server.port as number));

    expect(capturedBody).toBeDefined();
    const body = capturedBody as Record<string, unknown>;
    expect(body.model).toBe('test-model');
    expect(body.temperature).toBe(0);
    expect(Array.isArray(body.messages)).toBe(true);
    const messages = body.messages as Array<{ role: string; content: string }>;
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]).toEqual({ role: 'user', content: '테스트' });
  });
});
