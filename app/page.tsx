import Navbar from "./components/Navbar";
import Hero from "./components/hero/Hero";
import AscendPath from "./components/AscendPath";
import ProductProof from "./components/ProductProof";
import Features from "./components/Features";
import MusicSpotlight from "./components/MusicSpotlight";
import AscendWorkSpotlight from "./components/AscendWorkSpotlight";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <Hero />

        <AscendPath />

        <ProductProof />

        <Features />

        <AscendWorkSpotlight />

        <MusicSpotlight />

        <CTA />
      </main>

      <Footer />
    </>
  );
}
