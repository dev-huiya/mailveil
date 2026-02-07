import { categories, type Category } from "./words";

function getRandomWord(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

export function generateEmail(
  categoryId: string,
  domain: string
): { email: string; word1: string; word2: string; category: Category } {
  const category = categories.find((c) => c.id === categoryId) || categories[categories.length - 1];
  let word1 = getRandomWord(category.words);
  let word2 = getRandomWord(category.words);

  // Ensure two different words
  while (word2 === word1 && category.words.length > 1) {
    word2 = getRandomWord(category.words);
  }

  return {
    email: `${word1}.${word2}@${domain}`,
    word1,
    word2,
    category,
  };
}

export function generateRuleName(categoryName: string, word1: string, word2: string): string {
  return `${categoryName}: ${word1}.${word2}`;
}
