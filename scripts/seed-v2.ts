import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

const SOURCES_SEED = [
  { name: "the-guardian-tech", nameCn: "卫报·科技", category: "科技", feedUrl: "https://www.theguardian.com/technology/rss", color: "#C0592B" },
  { name: "the-guardian-science", nameCn: "卫报·科学", category: "科学", feedUrl: "https://www.theguardian.com/science/rss", color: "#C0592B" },
  { name: "the-guardian-education", nameCn: "卫报·教育", category: "教育", feedUrl: "https://www.theguardian.com/education/rss", color: "#C0592B" },
  { name: "the-guardian-society", nameCn: "卫报·社会", category: "社会", feedUrl: "https://www.theguardian.com/society/rss", color: "#C0592B" },
  { name: "the-guardian-environment", nameCn: "卫报·环境", category: "环境", feedUrl: "https://www.theguardian.com/environment/rss", color: "#C0592B" },
  { name: "the-economist", nameCn: "经济学人", category: "商业", feedUrl: "https://www.economist.com/rss", color: "#E3120B" },
  { name: "scientific-american", nameCn: "科学美国人", category: "科学", feedUrl: "http://rss.sciam.com/ScientificAmerican-Global", color: "#2A6496" },
  { name: "the-atlantic", nameCn: "大西洋月刊", category: "文化", feedUrl: "https://www.theatlantic.com/feed/all/", color: "#F07D00" },
  { name: "new-yorker", nameCn: "纽约客", category: "文化", feedUrl: "https://www.newyorker.com/feed/rss", color: "#000000" },
  { name: "national-geographic", nameCn: "国家地理", category: "科学", feedUrl: "https://www.nationalgeographic.com/feed/", color: "#FFCC00" },
  { name: "bbc-news", nameCn: "BBC新闻", category: "综合", feedUrl: "http://feeds.bbci.co.uk/news/rss.xml", color: "#BB1919" },
  { name: "time", nameCn: "时代周刊", category: "综合", feedUrl: "https://time.com/feed/", color: "#E8112D" },
  { name: "wired", nameCn: "连线", category: "科技", feedUrl: "https://www.wired.com/feed/rss", color: "#000000" },
];

async function main() {
  console.log("🌱 正在初始化 V2.0 数据...");

  for (const source of SOURCES_SEED) {
    const existing = await prisma.source.findFirst({ where: { name: source.name } });
    if (!existing) {
      await prisma.source.create({ data: source });
    }
  }
  console.log(`✅ 已初始化 ${SOURCES_SEED.length} 个来源`);

  const adminExists = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!adminExists) {
    const passwordHash = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash,
        nickname: "管理员",
        role: "admin",
      },
    });
    console.log("✅ 已创建管理员账号 (admin / admin123)");
  } else {
    console.log("ℹ️ 管理员账号已存在");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
