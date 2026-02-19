import type { CodeBlock } from './types.ts';

export function extractCodeBlocks(text: string): {
  prose: string;
  blocks: CodeBlock[];
} {
  const blocks: CodeBlock[] = [];
  let index = 0;
  let prose = text;

  // 1. Extract fenced code blocks (``` ... ```) first
  prose = prose.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${index++}__`;
    blocks.push({ placeholder, original: match });
    return placeholder;
  });

  // 2. Extract inline code (` ... `)
  prose = prose.replace(/`[^`]+`/g, (match) => {
    const placeholder = `__CODE_BLOCK_${index++}__`;
    blocks.push({ placeholder, original: match });
    return placeholder;
  });

  return { prose, blocks };
}

export function restoreCodeBlocks(text: string, blocks: CodeBlock[]): string {
  let result = text;
  for (const block of blocks) {
    result = result.replace(block.placeholder, block.original);
  }
  return result;
}
