import {
  categories,
  FORBIDDEN_WORDS,
  type Category,
} from "./words";

const VOWELS = "aeiou";
const HARD_CONSONANTS = "kptgbdcqxj";
const SOFT_CONSONANTS = "sfvmnlrzwyh";
const ALL_CONSONANTS = "bcdfghjklmnpqrstvwxz";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 풀에서 n개 서로 다른 단어 선택 (exclude에 있는 것 제외) */
function pickUniqueWords(
  words: string[],
  n: number,
  exclude: Set<string> = new Set()
): string[] {
  const available = words.filter(
    (w) => !exclude.has(w.toLowerCase())
  );
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const result: string[] = [];
  const used = new Set<string>();
  for (const w of shuffled) {
    if (result.length >= n) break;
    const lower = w.toLowerCase();
    if (used.has(lower)) continue;
    used.add(lower);
    result.push(w);
  }
  return result;
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function analyzeSeed(seed: string): {
  length: number;
  consonants: Set<string>;
  vowels: Set<string>;
  hasHard: boolean;
  hasSoft: boolean;
} {
  const consonants = new Set<string>();
  const vowels = new Set<string>();
  let hasHard = false;
  let hasSoft = false;
  for (const c of seed.toLowerCase()) {
    if (VOWELS.includes(c)) {
      vowels.add(c);
    } else if (ALL_CONSONANTS.includes(c)) {
      consonants.add(c);
      if (HARD_CONSONANTS.includes(c)) hasHard = true;
      else if (SOFT_CONSONANTS.includes(c)) hasSoft = true;
    }
  }
  return {
    length: seed.length,
    consonants,
    vowels,
    hasHard,
    hasSoft,
  };
}

function getSubstituteConsonants(seedConsonants: Set<string>): string[] {
  const pool: string[] = [];
  const seedHasHard = [...seedConsonants].some((c) =>
    HARD_CONSONANTS.includes(c)
  );
  const seedHasSoft = [...seedConsonants].some((c) =>
    SOFT_CONSONANTS.includes(c)
  );
  if (seedHasHard) {
    for (const c of HARD_CONSONANTS) {
      if (!seedConsonants.has(c)) pool.push(c);
    }
  }
  if (seedHasSoft || pool.length === 0) {
    for (const c of SOFT_CONSONANTS) {
      if (!seedConsonants.has(c)) pool.push(c);
    }
  }
  return pool.length > 0 ? pool : [...ALL_CONSONANTS].filter((c) => !seedConsonants.has(c));
}

function getSubstituteVowels(seedVowels: Set<string>): string[] {
  return [...VOWELS].filter((v) => !seedVowels.has(v));
}

function containsSubstring(suffix: string, seed: string): boolean {
  const s = suffix.toLowerCase();
  const seedLower = seed.toLowerCase();
  for (let i = 0; i <= s.length - seedLower.length; i++) {
    if (s.slice(i, i + seedLower.length) === seedLower) return true;
  }
  return false;
}

function hasConsecutiveSameType(str: string, type: "vowel" | "consonant", count: number): boolean {
  let streak = 0;
  for (const c of str.toLowerCase()) {
    if (c < "a" || c > "z") continue;
    const isV = VOWELS.includes(c);
    const matches = type === "vowel" ? isV : !isV;
    if (matches) {
      streak++;
      if (streak >= count) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

function generateAutoSuffix(
  seed: string,
  analysis: ReturnType<typeof analyzeSeed>,
  existing: Set<string>,
  maxAttempts = 50
): string | null {
  const targetLen = Math.min(
    8,
    Math.max(4, analysis.length + (Math.random() > 0.5 ? 1 : -1))
  );
  const consonantPool = getSubstituteConsonants(analysis.consonants);
  const vowelPool = getSubstituteVowels(analysis.vowels);
  if (vowelPool.length === 0 || consonantPool.length === 0) return null;

  const minEditDist = Math.ceil(seed.length / 2);
  const seedLower = seed.toLowerCase();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const chars: string[] = [];
    for (let i = 0; i < targetLen; i++) {
      const useVowel = i % 2 === 1;
      chars.push(
        useVowel
          ? pickRandom(vowelPool)
          : pickRandom(consonantPool)
      );
    }

    const suffix = chars.join("");
    if (suffix === seedLower || suffix === seed) continue;
    if (containsSubstring(suffix, seed)) continue;
    if (hasConsecutiveSameType(suffix, "consonant", 3)) continue;
    if (hasConsecutiveSameType(suffix, "vowel", 3)) continue;
    if (editDistance(seedLower, suffix) < minEditDist) continue;
    if (FORBIDDEN_WORDS.has(suffix)) continue;
    if (existing.has(suffix)) continue;

    return suffix;
  }
  return null;
}

export interface EmailSuggestion {
  email: string;
  seed: string;
  suffix: string;
}

export interface GenerateResult {
  suggestions: EmailSuggestion[];
  category: Category;
}

export function generateEmailSuggestions(
  categoryId: string,
  domain: string,
  excludeSeeds?: Set<string>
): GenerateResult {
  const category =
    categories.find((c) => c.id === categoryId) || categories[categories.length - 1];
  const pool = category.words;
  const usedSeeds = new Set<string>();
  const usedSuffixes = new Set<string>();
  const suggestions: EmailSuggestion[] = [];

  const exclude = excludeSeeds ?? new Set<string>();

  // 1. 풀 기반 3개 (단어풀 먼저) - seed와 suffix 모두 풀에서, 5개 모두 seed 다름
  const poolSeeds = pickUniqueWords(pool, 3, exclude);
  for (const seed of poolSeeds) {
    usedSeeds.add(seed.toLowerCase());
    const suffixCandidates = pool.filter(
      (w) =>
        w.toLowerCase() !== seed.toLowerCase() &&
        !usedSuffixes.has(w.toLowerCase())
    );
    const suffix = pickRandom(suffixCandidates);
    if (suffix) {
      usedSuffixes.add(suffix.toLowerCase());
      suggestions.push({
        email: `${seed}.${suffix}@${domain}`,
        seed,
        suffix,
      });
    }
  }

  // 2. 자동 생성 2개 (랜덤 아래) - seed는 풀에서, suffix는 자동생성
  const autoSeeds = pickUniqueWords(pool, 2, usedSeeds);
  for (const seed of autoSeeds) {
    usedSeeds.add(seed.toLowerCase());
    const analysis = analyzeSeed(seed);
    const suffix = generateAutoSuffix(seed, analysis, usedSuffixes);
    if (suffix) {
      usedSuffixes.add(suffix);
      suggestions.push({
        email: `${seed}.${suffix}@${domain}`,
        seed,
        suffix,
      });
    }
  }

  return {
    suggestions,
    category,
  };
}

export function generateRuleName(
  categoryName: string,
  seed: string,
  suffix: string
): string {
  return `${categoryName}: ${seed}.${suffix}`;
}
