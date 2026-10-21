import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Numbers from "@/components/Numbers";
import About from "@/components/About";
import Team from "@/components/Team";
import EventsPreview from "@/components/EventsPreview";
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
      <SmoothScroll />
      <main>
        <JsonLd />
        <Hero />
        <Numbers />
        <About />
        <Team />
        <EventsPreview />
        <JoinCta />
      </main>
      <Footer />
    </>
  );
}
