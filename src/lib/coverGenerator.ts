const UNSPLASH_TOPICS: Record<string, string[]> = {
  technology: ["technology", "computer", "innovation", "digital", "coding"],
  science: ["science", "laboratory", "research", "nature", "space"],
  education: ["education", "university", "books", "learning", "classroom"],
  world: ["world", "city", "architecture", "travel", "culture"],
  society: ["people", "community", "urban", "lifestyle", "business"],
  culture: ["art", "design", "creative", "modern", "abstract"],
};

const SOURCE_CATEGORY_MAP: Record<string, string> = {
  "the-guardian": "world",
  "the-guardian-tech": "technology",
  "the-guardian-science": "science",
  "the-guardian-education": "education",
  "the-guardian-society": "society",
  "bbc-news": "world",
  "bbc-tech": "technology",
  "bbc-science": "science",
  "bbc-education": "education",
  "nytimes": "world",
  "nytimes-science": "science",
  "the-atlantic": "culture",
  "scientific-american": "science",
};

function getCategory(source: string): string {
  return SOURCE_CATEGORY_MAP[source] || "world";
}

function getKeywordForTitle(title: string, category: string): string {
  const keywords = UNSPLASH_TOPICS[category] || UNSPLASH_TOPICS.world;
  const titleLower = title.toLowerCase();

  for (const keyword of keywords) {
    if (titleLower.includes(keyword)) {
      return keyword;
    }
  }

  return keywords[Math.floor(Math.random() * keywords.length)];
}

function generateSeed(title: string, source: string): number {
  let hash = 0;
  const str = `${title}-${source}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function generateCoverImageUrl(
  title: string,
  source: string,
  width: number = 800,
  height: number = 450
): string {
  const category = getCategory(source);
  const keyword = getKeywordForTitle(title, category);
  const seed = generateSeed(title, source);

  return `https://source.unsplash.com/${width}x${height}/?${keyword}&sig=${seed}`;
}

export function getCoverImageWithFallback(
  title: string,
  source: string,
  existingImageUrl?: string | null
): string | undefined {
  if (existingImageUrl && existingImageUrl.trim() !== "") {
    return existingImageUrl;
  }

  return generateCoverImageUrl(title, source);
}
