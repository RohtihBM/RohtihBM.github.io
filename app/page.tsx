import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/work/Work";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Experience />
        <About />
      </main>
      <Contact />
    </>
  );
}
