export function isEnglish(text: string): boolean {
  if (!text || text.trim().length === 0) return true;

  let prose = text.replace(/```[\s\S]*?```/g, ' ');
  prose = prose.replace(/`[^`]*`/g, ' ');

  let latinCount = 0;
  let nonLatinCount = 0;

  for (const ch of prose) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;

    if (
      (cp >= 0x0041 && cp <= 0x005a) || // A-Z
      (cp >= 0x0061 && cp <= 0x007a) || // a-z
      (cp >= 0x00c0 && cp <= 0x024f) // Latin Extended
    ) {
      latinCount++;
    } else if (
      (cp >= 0x4e00 && cp <= 0x9fff) || // CJK
      (cp >= 0xac00 && cp <= 0xd7af) || // Hangul
      (cp >= 0x0400 && cp <= 0x04ff) || // Cyrillic
      (cp >= 0x0600 && cp <= 0x06ff) || // Arabic
      (cp >= 0x0e00 && cp <= 0x0e7f) || // Thai
      (cp >= 0x0900 && cp <= 0x097f) // Devanagari
    ) {
      nonLatinCount++;
    }
  }

  const total = latinCount + nonLatinCount;
  if (total === 0) return true;

  return latinCount / total >= 0.7;
}
