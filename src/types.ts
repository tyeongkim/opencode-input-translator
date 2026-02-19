export interface TranslatorConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface CodeBlock {
  placeholder: string;
  original: string;
}

export interface TranslationResult {
  translated: boolean;
  text: string;
}
