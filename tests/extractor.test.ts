import { describe, expect, test } from 'bun:test';
import { extractCodeBlocks, restoreCodeBlocks } from '../src/extractor.ts';

describe('extractCodeBlocks / restoreCodeBlocks', () => {
  test('fenced code block extraction + restoration roundtrip', () => {
    const input = 'Please fix this:\n```ts\nconst x = 1;\n```\nThanks!';
    const { prose, blocks } = extractCodeBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(prose).not.toContain('```');
    expect(prose).toContain('__CODE_BLOCK_0__');
    expect(restoreCodeBlocks(prose, blocks)).toBe(input);
  });

  test('inline code extraction + restoration roundtrip', () => {
    const input = 'Use `Array.map()` for this';
    const { prose, blocks } = extractCodeBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(prose).not.toContain('`');
    expect(restoreCodeBlocks(prose, blocks)).toBe(input);
  });

  test('multiple code blocks (fenced + inline mixed) roundtrip', () => {
    const input = 'Fix `foo` and:\n```js\nbar()\n```\nAlso `baz`';
    const { prose, blocks } = extractCodeBlocks(input);
    expect(blocks).toHaveLength(3);
    expect(restoreCodeBlocks(prose, blocks)).toBe(input);
  });

  test('no code blocks → prose unchanged, empty blocks', () => {
    const input = 'Just plain text here';
    const { prose, blocks } = extractCodeBlocks(input);
    expect(prose).toBe(input);
    expect(blocks).toHaveLength(0);
  });

  test('text that is only a fenced code block', () => {
    const input = "```py\nprint('hi')\n```";
    const { prose, blocks } = extractCodeBlocks(input);
    expect(blocks).toHaveLength(1);
    expect(prose).toBe('__CODE_BLOCK_0__');
    expect(restoreCodeBlocks(prose, blocks)).toBe(input);
  });

  test('empty string → empty prose, empty blocks', () => {
    const { prose, blocks } = extractCodeBlocks('');
    expect(prose).toBe('');
    expect(blocks).toHaveLength(0);
  });
});
