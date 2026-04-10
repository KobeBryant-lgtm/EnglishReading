"use client";

import { SOURCES } from "@/types";

const SOURCE_DESCRIPTIONS: Record<string, { description: string; frequency: string; topics: string[] }> = {
  "the-guardian": {
    description: "英国主流日报，考研英语阅读最高频来源。文章风格严谨，用词规范，社会评论类文章居多。",
    frequency: "极高",
    topics: ["社会", "教育", "科技", "环境", "政治"],
  },
  "the-guardian-tech": {
    description: "卫报科技版块，聚焦科技行业动态，与电子信息专业高度相关。",
    frequency: "极高",
    topics: ["人工智能", "互联网", "隐私", "创新"],
  },
  "the-guardian-science": {
    description: "卫报科学版块，覆盖前沿科学发现，适合练习学术类阅读。",
    frequency: "极高",
    topics: ["物理", "生物", "医学", "气候"],
  },
  "the-guardian-education": {
    description: "卫报教育版块，关注全球教育话题，考研教育类文章常见来源。",
    frequency: "高",
    topics: ["高等教育", "教育政策", "学术研究"],
  },
  "the-guardian-society": {
    description: "卫报社会版块，深度社会报道，考研社会类文章重要来源。",
    frequency: "高",
    topics: ["社会问题", "人口", "福利", "文化"],
  },
  "scientific-american": {
    description: "美国知名科普杂志，科技类文章的重要来源，文章难度较高，适合冲刺阶段练习。",
    frequency: "高",
    topics: ["科技", "自然", "医学", "工程"],
  },
  "the-atlantic": {
    description: "美国深度报道杂志，文化评论类文章来源，文章思想深度高，语言优美。",
    frequency: "高",
    topics: ["文化", "科技", "社会", "政治"],
  },
};

export default function SourcesContent() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold mb-1.5"
          style={{ color: "var(--text-primary)", fontFamily: "var(--serif)", letterSpacing: "-0.02em" }}
        >
          外刊来源
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          考研英语阅读文章的主要来源外刊
        </p>
      </div>

      <div className="space-y-3">
        {SOURCES.map((source) => {
          const info = SOURCE_DESCRIPTIONS[source.name];
          return (
            <div key={source.name} className="card p-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: source.color }}
                >
                  {source.nameCn[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {source.nameCn}
                    </h3>
                    <span className="source-tag">{source.category}</span>
                  </div>

                  {info && (
                    <>
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        {info.description}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          出题频率: {info.frequency}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {info.topics.map((topic) => (
                            <span
                              key={topic}
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-muted)",
                                border: "1px solid var(--border-color)",
                              }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-8 p-5 rounded-md"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          备考建议
        </h3>
        <ul
          className="space-y-1.5 text-xs list-none"
          style={{ color: "var(--text-muted)" }}
        >
          <li>1. 每天至少精读 1-2 篇外刊文章，培养语感</li>
          <li>2. 重点关注《卫报》的社会评论类文章</li>
          <li>3. 遇到生词先根据上下文猜测，再查词典确认</li>
          <li>4. 注意文章的论证结构和逻辑关系词</li>
          <li>5. 积累高频学术词汇，特别是动词和形容词的同义替换</li>
          <li>6. 关注文章中的长难句，练习拆分句子结构</li>
        </ul>
      </div>
    </div>
  );
}
