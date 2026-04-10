export interface Article {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  author?: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  difficulty: string;
  wordCount: number;
  publishedAt?: Date;
  crawledAt: Date;
  createdAt: Date;
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition?: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  articleId?: string;
  reviewCount: number;
  mastered: boolean;
  createdAt: Date;
  lastReviewedAt?: Date;
}

export interface Translation {
  id: string;
  articleId: string;
  paragraphIndex: number;
  originalText: string;
  translatedText: string;
  createdAt: Date;
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export interface SourceConfig {
  name: string;
  nameCn: string;
  rssUrl: string;
  category: string;
  color: string;
}

export const SOURCES: SourceConfig[] = [
  {
    name: "the-guardian",
    nameCn: "卫报",
    rssUrl: "https://www.theguardian.com/world/rss",
    category: "world",
    color: "#052962",
  },
  {
    name: "the-guardian-tech",
    nameCn: "卫报·科技",
    rssUrl: "https://www.theguardian.com/technology/rss",
    category: "technology",
    color: "#052962",
  },
  {
    name: "the-guardian-science",
    nameCn: "卫报·科学",
    rssUrl: "https://www.theguardian.com/science/rss",
    category: "science",
    color: "#052962",
  },
  {
    name: "the-guardian-education",
    nameCn: "卫报·教育",
    rssUrl: "https://www.theguardian.com/education/rss",
    category: "education",
    color: "#052962",
  },
  {
    name: "the-guardian-society",
    nameCn: "卫报·社会",
    rssUrl: "https://www.theguardian.com/society/rss",
    category: "society",
    color: "#052962",
  },
  {
    name: "bbc-news",
    nameCn: "BBC新闻",
    rssUrl: "http://feeds.bbci.co.uk/news/world/rss.xml",
    category: "world",
    color: "#BB1919",
  },
  {
    name: "bbc-tech",
    nameCn: "BBC·科技",
    rssUrl: "http://feeds.bbci.co.uk/news/technology/rss.xml",
    category: "technology",
    color: "#BB1919",
  },
  {
    name: "bbc-science",
    nameCn: "BBC·科学",
    rssUrl: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    category: "science",
    color: "#BB1919",
  },
  {
    name: "bbc-education",
    nameCn: "BBC·教育",
    rssUrl: "http://feeds.bbci.co.uk/news/education/rss.xml",
    category: "education",
    color: "#BB1919",
  },
  {
    name: "nytimes",
    nameCn: "纽约时报",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    category: "world",
    color: "#333333",
  },
  {
    name: "nytimes-science",
    nameCn: "纽约时报·科学",
    rssUrl: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
    category: "science",
    color: "#333333",
  },
  {
    name: "the-atlantic",
    nameCn: "大西洋月刊",
    rssUrl: "https://www.theatlantic.com/feed/all/",
    category: "culture",
    color: "#E2231A",
  },
  {
    name: "scientific-american",
    nameCn: "科学美国人",
    rssUrl: "https://rss.sciam.com/ScientificAmerican-Global",
    category: "science",
    color: "#00857C",
  },
];

export const DIFFICULTY_LABELS: Record<string, string> = {
  cet4: "四级",
  cet6: "六级",
  kaoyan: "考研",
  beyond: "超纲",
};
