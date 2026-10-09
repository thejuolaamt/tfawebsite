import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import About from "@/components/About";
import MissionVision from "@/components/MissionVision";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollReveal />
      <main className="bg-[#0a0a0a] text-white">
        {/* Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 text-sm uppercase tracking-[0.3em] text-sky-300/70">
            Welcome to
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            The Fine Artist Community
          </h1>
          <p className="mt-8 text-lg text-white/80">
            A home for artists to create, exhibit, and grow together.
          </p>
        </section>
        <About />
        <MissionVision />
      </main>
    </>
  );
}



