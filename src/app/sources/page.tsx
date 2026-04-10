import Navbar from "@/components/Navbar";
import SourcesContent from "@/components/SourcesContent";

export default function SourcesPage() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <SourcesContent />
    </main>
  );
}
