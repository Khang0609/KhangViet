import Header from "@/components/modules/header/Header";
import HeroSection from "@/components/modules/HeroSection";
import TrustMarquee from "@/components/modules/TrustMarquee";
import DisciplinesSection from "@/components/modules/DisciplinesSection";
import ProjectShowcase from "@/components/modules/project-showcase/ProjectShowcase";
import InHouseEngineering from "@/components/modules/InHouseEngineering";
import ContactDualGates from "@/components/modules/contact-gate/ContactDualGates";
import Footer from "@/components/modules/Footer";
import { ModalProvider } from "@/components/modals/modalContext";
import LazyModalContainer from "@/components/modals/LazyModalContainer";

export default function Home() {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-(--bg-obsidian) text-(--text-primary)">
        <Header />

        <main id="top">
          <HeroSection />
          <TrustMarquee />
          <DisciplinesSection />
          <ProjectShowcase />
          <InHouseEngineering />
          <ContactDualGates />
        </main>

        <Footer />
        <LazyModalContainer />
      </div>
    </ModalProvider>
  );
}
