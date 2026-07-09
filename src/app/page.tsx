import {
  About,
  Certifications,
  Contact,
  Experience,
  FeaturedAmyra,
  Footer,
  Hero,
  Hobbies,
  Navbar,
  PersonalProjects,
  Projects,
  Skills,
} from "@/shared/components/sections";

/** Thin orchestrator — composes the page sections (no business logic). */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* Evidence first: the product with paying customers, then the five
            playable demos. Narrative sections follow. */}
        <FeaturedAmyra />
        <PersonalProjects />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Hobbies />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
