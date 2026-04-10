import Navbar from "@/components/Navbar";
import VocabularyContent from "@/components/VocabularyContent";

export default function VocabularyPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <VocabularyContent />
    </main>
  );
}
