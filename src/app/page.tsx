import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import Numbers from "@/components/Numbers";
import OurStory from "@/components/OurStory";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";
import Team from "@/components/Team";
import Milestones from "@/components/Milestones";
import Upcoming from "@/components/Upcoming";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd"; // Add this line here

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>
        <JsonLd /> {/* This is the one-line layout edit */}
        <Hero />
        <Numbers />
        <OurStory />
        <About />
        <MissionVision />
        <Team />
        <Milestones />
        <Upcoming />
        <JoinCta />
      </main>
      <Footer />
    </>
  );
}
