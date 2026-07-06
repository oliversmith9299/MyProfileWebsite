import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Certificates } from "@/components/sections/Certificates";
import { Contact } from "@/components/sections/Contact";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";
import { Timeline } from "@/components/sections/Timeline";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { PageAnalytics } from "@/components/PageAnalytics";

export default function Home() {
  return (
    <>
      <Navbar />
      <CommandPalette />
      <PageAnalytics />
      <main>
        <Hero />
        <About />
        <Timeline />
        <Projects />
        <Skills />
        <ExperienceSection />
        <Certificates />
        <Services />
        <BlogPreview />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
