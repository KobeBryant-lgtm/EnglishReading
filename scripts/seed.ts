import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleArticles = [
  {
    title: "AI Could Transform How We Diagnose and Treat Diseases, Say Researchers",
    source: "the-guardian-tech",
    sourceUrl: "https://www.theguardian.com/technology/2025/sample-ai-health",
    author: "Sarah Chen",
    content: "Artificial intelligence is poised to revolutionise healthcare in ways that were unimaginable just a decade ago, according to a comprehensive new study published in Nature Medicine. Researchers at leading universities across the UK and US have demonstrated that machine learning algorithms can now diagnose certain conditions with accuracy rates exceeding those of experienced physicians. The study, which analysed data from more than 500,000 patients across 12 hospitals, found that AI systems correctly identified early-stage cancers in 94% of cases, compared with 88% for human doctors. This represents a significant leap forward in diagnostic medicine and could potentially save thousands of lives each year through earlier intervention. However, experts caution that the technology should be viewed as a complement to, rather than a replacement for, human medical judgement. Professor James Mitchell of Imperial College London, who led the research, emphasised that the AI system works best when used alongside clinicians who can interpret results in the broader context of a patient's medical history and personal circumstances. The implications for healthcare systems worldwide are profound. In countries where access to specialist medical expertise is limited, AI diagnostic tools could help bridge the gap between demand and supply for medical services. Rural communities in particular stand to benefit, as the technology can be deployed remotely without requiring patients to travel long distances to see specialists. Critics have raised concerns about data privacy and the potential for algorithmic bias, particularly in relation to underrepresented demographic groups. The researchers acknowledge these challenges and stress that rigorous testing and validation across diverse populations are essential before widespread deployment. The NHS has already begun pilot programmes in several trusts, with early results showing promising improvements in diagnostic turnaround times. If these trials prove successful, the technology could be rolled out more broadly within the next three to five years, fundamentally changing how healthcare is delivered in Britain.",
    summary: "一项新研究表明，AI诊断某些疾病的准确率已超过经验丰富的医生，但专家强调AI应作为人类医疗判断的补充而非替代。",
    difficulty: "kaoyan",
    wordCount: 285,
    publishedAt: new Date("2025-03-15"),
  },
  {
    title: "Universities Must Adapt to the Changing Landscape of Higher Education",
    source: "the-guardian-education",
    sourceUrl: "https://www.theguardian.com/education/2025/sample-university",
    author: "David Williams",
    content: "The traditional model of higher education is facing unprecedented challenges that demand fundamental reform, according to a major report released by the Higher Education Policy Institute. The report argues that universities must move beyond their centuries-old reliance on lectures and examinations and embrace more innovative approaches to teaching and assessment. The decline in university applications over the past three years reflects a growing disillusionment among young people with the value of a traditional degree. Rising tuition fees, coupled with the increasing availability of alternative credentials and online learning platforms, have led many to question whether a university education still represents the best path to career success. Professor Elena Rodriguez of the University of Manchester argues that institutions need to fundamentally rethink their relationship with students. Rather than treating education as a transactional experience, universities should focus on developing critical thinking skills and fostering intellectual curiosity that will serve graduates throughout their careers. The report highlights several innovative programmes already underway at universities across the country. These include project-based learning initiatives, industry partnerships that provide real-world experience, and flexible degree structures that allow students to combine academic study with practical training. Critics of the proposed reforms warn that moving away from traditional academic standards could undermine the quality and reputation of British higher education. They argue that the rigour of conventional assessment methods ensures that graduates possess the depth of knowledge and analytical skills that employers value. However, supporters of change contend that the current system is failing to prepare students for the realities of the modern workplace, where adaptability and practical problem-solving abilities are increasingly prized over theoretical knowledge alone.",
    summary: "高等教育政策研究所报告指出，大学必须改革传统教学模式，以应对申请人数下降和替代性教育途径兴起的挑战。",
    difficulty: "kaoyan",
    wordCount: 260,
    publishedAt: new Date("2025-03-14"),
  },
  {
    title: "Climate Change Is Reshaping Global Migration Patterns, Study Finds",
    source: "the-guardian-science",
    sourceUrl: "https://www.theguardian.com/science/2025/sample-climate-migration",
    author: "Maria Gonzalez",
    content: "Rising temperatures and extreme weather events are driving unprecedented shifts in global migration patterns, according to a landmark study published in the journal Science. The research, conducted by an international team of climate scientists and demographers, reveals that climate-related displacement has increased by 65% over the past decade, with an estimated 30 million people forcibly relocated from their homes each year. The findings paint a stark picture of a world in which climate change is no longer a distant threat but an immediate reality affecting millions of lives. Coastal communities in Southeast Asia, sub-Saharan Africa, and small island nations are particularly vulnerable, facing the dual challenges of rising sea levels and increasingly severe storms. Dr Amara Osei of the United Nations Environment Programme emphasised that the international community must urgently develop comprehensive frameworks for climate migration. Current immigration policies in most countries are ill-equipped to handle the scale of displacement that climate change is expected to cause in the coming decades. The study identifies several key mechanisms through which climate change drives migration. Drought and desertification are destroying agricultural livelihoods in rural areas, pushing millions towards cities and across borders. Meanwhile, flooding and coastal erosion are rendering some low-lying regions permanently uninhabitable, creating a new category of climate refugees who have no prospect of returning home. Perhaps most concerning is the finding that these migration pressures are accelerating. Under current emissions trajectories, the number of climate-displaced people could reach 200 million by 2050, with profound implications for global stability and international relations. The researchers call for a fundamental rethinking of how the international community approaches climate adaptation and migration policy.",
    summary: "一项发表在《科学》杂志上的研究表明，气候变化正以前所未有的方式重塑全球移民模式，气候相关流离失所人数在过去十年增长了65%。",
    difficulty: "kaoyan",
    wordCount: 275,
    publishedAt: new Date("2025-03-13"),
  },
  {
    title: "The Social Media Paradox: Why More Connection Leaves Us Feeling More Isolated",
    source: "the-guardian-society",
    sourceUrl: "https://www.theguardian.com/society/2025/sample-social-media",
    author: "Rachel Thompson",
    content: "Despite being more digitally connected than at any point in human history, people around the world are reporting unprecedented levels of loneliness and social isolation. This paradox lies at the heart of a growing body of research that suggests social media, far from bringing us closer together, may actually be driving us apart. A comprehensive study conducted by researchers at the University of Oxford followed 10,000 participants over five years and found a strong correlation between heavy social media use and feelings of loneliness, anxiety, and depression. The effect was particularly pronounced among young adults aged 18 to 25, who reported spending an average of four hours per day on social media platforms. Dr Catherine Hayes, the lead researcher, explains that the problem lies not in the technology itself but in how it reshapes our social expectations and behaviours. Social media creates an illusion of connection while simultaneously undermining the deep, meaningful relationships that humans fundamentally need for psychological wellbeing. The study found that participants who limited their social media use to 30 minutes per day reported significant improvements in mood and life satisfaction within just two weeks. Those who replaced social media time with face-to-face social interactions showed even greater improvements. The findings have prompted calls for greater regulation of social media platforms and for educational programmes that help young people develop healthier relationships with technology. Several countries are already experimenting with digital wellbeing initiatives in schools, teaching students to critically evaluate their online habits and prioritise genuine human connection over digital engagement.",
    summary: "牛津大学研究发现，社交媒体使用与孤独感之间存在强相关性，每天使用超过4小时的年轻人受影响最严重，减少使用可显著改善心理健康。",
    difficulty: "cet6",
    wordCount: 255,
    publishedAt: new Date("2025-03-12"),
  },
  {
    title: "Breakthrough in Quantum Computing Brings Practical Applications Closer",
    source: "scientific-american",
    sourceUrl: "https://www.scientificamerican.com/sample-quantum",
    author: "Michael Park",
    content: "A team of physicists at the Massachusetts Institute of Technology has achieved a breakthrough in quantum error correction that could accelerate the development of practical quantum computers. The advance, published in Nature, demonstrates a new approach to maintaining quantum coherence that reduces error rates by an order of magnitude compared with existing methods. Quantum computers have long promised to solve problems that are intractable for classical computers, from drug discovery to cryptography. However, the fundamental challenge has been maintaining the delicate quantum states that give these machines their power. Even the slightest environmental disturbance can cause quantum bits, or qubits, to lose their quantum properties through a process known as decoherence. The MIT team developed a novel error correction code that can detect and fix errors in real time without disturbing the quantum computation itself. This is achieved by encoding logical qubits across multiple physical qubits and using sophisticated algorithms to identify and correct errors as they occur. Professor Lisa Chang, who led the research, described the result as a significant milestone on the path to fault-tolerant quantum computing. While practical quantum computers capable of solving real-world problems are still years away, this breakthrough substantially shortens the timeline. The implications for fields such as materials science, pharmaceuticals, and financial modelling are enormous. Quantum computers could simulate molecular interactions with unprecedented accuracy, potentially revolutionising drug development and materials design. They could also crack existing encryption systems, necessitating a wholesale shift to quantum-resistant cryptographic protocols.",
    summary: "MIT物理学家在量子纠错方面取得突破，将量子比特错误率降低了一个数量级，使实用化量子计算机的实现更近一步。",
    difficulty: "beyond",
    wordCount: 240,
    publishedAt: new Date("2025-03-11"),
  },
  {
    title: "The Future of Work: How Automation Is Redefining Employment",
    source: "the-atlantic",
    sourceUrl: "https://www.theatlantic.com/sample-future-work",
    author: "James Morrison",
    content: "The nature of work is undergoing a transformation as profound as the Industrial Revolution, driven by advances in artificial intelligence and automation that are reshaping entire industries. A new report from the World Economic Forum estimates that by 2030, automation will displace approximately 85 million jobs globally while simultaneously creating 97 million new roles that did not previously exist. The challenge, according to labour economists, is not simply the number of jobs lost or gained but the fundamental mismatch between the skills that workers currently possess and those that the emerging economy demands. Workers in manufacturing, transportation, and administrative roles face the highest risk of displacement, while demand is surging for professionals with expertise in data science, artificial intelligence, and renewable energy. Professor Sarah Kim of the London School of Economics argues that governments and educational institutions must urgently invest in reskilling programmes to prevent widespread unemployment and social disruption. The transition from an industrial to a digital economy requires a corresponding transformation in how we prepare people for work. The report also highlights the growing importance of soft skills such as creativity, emotional intelligence, and adaptability, which are difficult to automate and increasingly valued by employers. As routine tasks are automated, workers who can think critically, communicate effectively, and adapt to changing circumstances will be best positioned to thrive. Some countries are already taking proactive steps. Singapore has launched a comprehensive national skills programme that provides all citizens with annual training credits, while Denmark has pioneered a flexicurity model that combines labour market flexibility with strong social protections for workers in transition.",
    summary: "世界经济论坛报告估计，到2030年自动化将取代8500万个工作岗位，同时创造9700万个新岗位，但技能错配是最大挑战。",
    difficulty: "kaoyan",
    wordCount: 270,
    publishedAt: new Date("2025-03-10"),
  },
];

async function main() {
  console.log("🌱 正在插入示例数据...");

  for (const article of sampleArticles) {
    await prisma.article.create({ data: article });
  }

  console.log(`✅ 已插入 ${sampleArticles.length} 篇示例文章`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
