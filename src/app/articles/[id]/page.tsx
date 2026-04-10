import Navbar from "@/components/Navbar";
import ArticleDetailContent from "@/components/ArticleDetailContent";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <ArticleDetailContent articleId={id} />
    </main>
  );
}
