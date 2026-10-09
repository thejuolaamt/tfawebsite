import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>
        <Hero />
        <About />
        <MissionVision />
      </main>
    </>
  );
}
