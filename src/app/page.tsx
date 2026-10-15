import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import Numbers from "@/components/Numbers";
import Workshop from "@/components/Workshop";
import OurStory from "@/components/OurStory";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";
import Team from "@/components/Team";
import Milestones from "@/components/Milestones";
import Upcoming from "@/components/Upcoming";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main>
        <JsonLd />
        <Hero />
        <Numbers />
        <Workshop />
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
