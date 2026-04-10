import Navbar from "@/components/Navbar";
import HomeContent from "@/components/HomeContent";

export default function Home() {
  return (
    <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <Navbar />
      <HomeContent />
    </main>
  );
}
