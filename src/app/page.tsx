import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import Numbers from "@/components/Numbers";
import OurStory from "@/components/OurStory";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";
import Milestones from "@/components/Milestones";
import Upcoming from "@/components/Upcoming";
import JoinCta from "@/components/JoinCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>
        <Hero />
        <Numbers />
        <OurStory />
        <About />
        <MissionVision />
        <Milestones />
        <Upcoming />
        <JoinCta />
      </main>
    </>
  );
}
