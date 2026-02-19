# opencode-input-translator

OpenCode plugin that automatically translates non-English user input to English before it reaches the AI model.

## Installation

Add to your `opencode.json` or `opencode.jsonc`:

```json
{
  "plugin": ["opencode-input-translator@latest"]
}
```

## Configuration

Set these environment variables before running OpenCode:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRANSLATOR_API_KEY` | Yes | — | API key for the OpenAI-compatible translation service |
| `TRANSLATOR_BASE_URL` | Yes | — | Base URL of the translation API (e.g. `https://api.openai.com`) |
| `TRANSLATOR_MODEL` | No | `gpt-5-nano-2025-08-07` | Model to use for translation |

## How it works

1. Intercepts outgoing user messages via OpenCode's `experimental.chat.messages.transform` hook
2. Detects the language of each text part — skips messages already in English
3. Extracts and preserves code blocks so they are never translated
4. Translates the remaining prose to English using your configured model
5. Replaces the original message text with the translated version

Messages that are already in English, empty, synthetic, or previously translated are left untouched.

## Supported providers

Any OpenAI-compatible API works:

- OpenAI
- Ollama
- LM Studio
- Any other service with an OpenAI-compatible `/v1/chat/completions` endpoint

## License

MIT
