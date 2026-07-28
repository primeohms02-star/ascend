import Navbar from "./components/Navbar";
import Hero from "./components/hero/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <Hero />

        <Features />

        <HowItWorks />

        <CTA />
      </main>

      <Footer />
    </>
  );
}