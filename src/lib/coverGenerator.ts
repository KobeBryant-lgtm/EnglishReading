const CATEGORY_PALETTES: Record<string, [string, string, string]> = {
  technology: ["#132743", "#256D85", "#47B5FF"],
  science: ["#211951", "#836FFF", "#F0A8D0"],
  education: ["#16423C", "#6A9C89", "#C4DAD2"],
  world: ["#7C2D12", "#EA580C", "#FDBA74"],
  society: ["#831843", "#DB2777", "#F9A8D4"],
  culture: ["#3B0764", "#9333EA", "#E879F9"],
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

function generateSeed(title: string, source: string): number {
  let hash = 2166136261;
  const str = `${title}-${source}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateCoverImageUrl(
  title: string,
  source: string,
  width: number = 800,
  height: number = 450
): string {
  const seed = generateSeed(title, source);
  const category = getCategory(source);
  const [start, middle, end] = CATEGORY_PALETTES[category] || CATEGORY_PALETTES.world;
  const angle = seed % 360;
  const circleX = 18 + (seed % 65);
  const circleY = 12 + ((seed >>> 8) % 70);
  const secondX = 15 + ((seed >>> 16) % 75);
  const secondY = 18 + ((seed >>> 24) % 62);
  const stripeOffset = seed % 44;

  // Embedded art paints immediately, needs no third-party request, and stays
  // stable for the same article title/source.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
        <stop offset="0" stop-color="${start}"/><stop offset=".52" stop-color="${middle}"/><stop offset="1" stop-color="${end}"/>
      </linearGradient>
      <radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <pattern id="grain" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="translate(${stripeOffset} 0) rotate(35)">
        <path d="M0 0V34" stroke="#fff" stroke-opacity=".10" stroke-width="1"/>
      </pattern>
      <filter id="blur"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <circle cx="${circleX}%" cy="${circleY}%" r="185" fill="url(#glow)" filter="url(#blur)"/>
    <circle cx="${secondX}%" cy="${secondY}%" r="120" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
    <circle cx="${secondX}%" cy="${secondY}%" r="82" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1"/>
    <path d="M-80 375 C120 235 250 505 470 315 S760 190 900 290 L900 520 L-80 520Z" fill="#fff" fill-opacity=".14"/>
    <path d="M-50 405 C155 285 300 510 520 338 S790 240 870 300" fill="none" stroke="#fff" stroke-opacity=".34" stroke-width="3"/>
    <rect width="800" height="450" fill="url(#grain)"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
