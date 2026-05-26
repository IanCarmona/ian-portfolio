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
        <About />
        <Experience />
        <Projects />
        <FeaturedAmyra />
        <PersonalProjects />
        <Skills />
        <Certifications />
        <Hobbies />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
