import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";
import OurStory from "@/components/OurStory";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>
        <Hero />
        <About />
        <MissionVision />
        <OurStory />
      </main>
    </>
  );
}

