export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?'"()[\]{}\-_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function compareTexts(
  spoken: string,
  expected: string,
  threshold: number = 1.0,
): boolean {
  const normalizedSpoken = normalizeText(spoken);
  const normalizedExpected = normalizeText(expected);

  if (normalizedSpoken === normalizedExpected) {
    return true;
  }

  // Если точное совпадение отсутствует, проверяем схожесть
  if (threshold < 1.0) {
    const similarity = calculateSimilarity(spoken, expected);
    return similarity >= threshold;
  }

  return false;
}

export function calculateSimilarity(spoken: string, expected: string): number {
  const normalizedSpoken = normalizeText(spoken);
  const normalizedExpected = normalizeText(expected);

  if (normalizedSpoken === normalizedExpected) {
    return 1.0;
  }

  // Простая оценка похожести на основе расстояния Левенштейна
  const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);
  const maxLength = Math.max(
    normalizedSpoken.length,
    normalizedExpected.length,
  );

  if (maxLength === 0) return 1.0;

  return 1 - distance / maxLength;
}

function levenshteinDistance(str1: string, str2: string): number {
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  let prev: number[] = Array(str1.length + 1)
    .fill(0)
    .map((_, i) => i);
  let curr: number[] = Array(str1.length + 1).fill(0);

  for (let j = 1; j <= str2.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        (curr[i - 1] ?? 0) + 1, // insertion
        (prev[i] ?? 0) + 1, // deletion
        (prev[i - 1] ?? 0) + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[str1.length] ?? 0;
}
