import Navbar from "./components/Navbar";
import Hero from "./components/hero/Hero";
import AscendPath from "./components/AscendPath";
import Features from "./components/Features";
import MusicSpotlight from "./components/MusicSpotlight";
import HowItWorks from "./components/HowItWorks";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <Hero />

        <AscendPath />

        <Features />

        <MusicSpotlight />

        <HowItWorks />

        <CTA />
      </main>

      <Footer />
    </>
  );
}
