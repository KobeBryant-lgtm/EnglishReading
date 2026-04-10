const CATEGORY_COLORS: Record<string, string> = {
  technology: "from-blue-500 to-cyan-500",
  science: "from-purple-500 to-indigo-500",
  education: "from-emerald-500 to-teal-500",
  world: "from-orange-500 to-red-500",
  society: "from-pink-500 to-rose-500",
  culture: "from-violet-500 to-fuchsia-500",
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

function generateSeed(title: string, source: string): string {
  let hash = 0;
  const str = `${title}-${source}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `article-${Math.abs(hash)}`;
}

export function generateCoverImageUrl(
  title: string,
  source: string,
  width: number = 800,
  height: number = 450
): string {
  const seed = generateSeed(title, source);

  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export function getCategoryGradient(source: string): string {
  const category = getCategory(source);
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.world;
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
