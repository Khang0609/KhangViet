import Header from "@/components/modules/header/Header";
import HeroSection from "@/components/modules/HeroSection";
import TrustMarquee from "@/components/modules/TrustMarquee";
import DisciplinesSection from "@/components/modules/DisciplinesSection";
import ProjectShowcase from "@/components/modules/project-showcase/ProjectShowcase";
import InHouseEngineering from "@/components/modules/InHouseEngineering";
import { ContactDualGates } from "@/components/modules/contact-gate";
import Footer from "@/components/modules/Footer";
import { ModalProvider } from "@/components/modals/modalContext";
import { LandingProvider } from "@/components/contexts/LandingContext";
import LazyModalContainer from "@/components/modals/LazyModalContainer";
import { getLandingContent } from "@/services/contentService";

export default async function Home() {
  const landing = await getLandingContent();

  return (
    <LandingProvider content={landing}>
      <ModalProvider>
        <div className="min-h-screen bg-(--bg-obsidian) text-(--text-primary)">
          <Header />

          <main id="top">
            <HeroSection />
            <TrustMarquee />
            <ProjectShowcase />
            <DisciplinesSection />
            <InHouseEngineering />
            <ContactDualGates />
          </main>

          <Footer />
          <LazyModalContainer />
        </div>
      </ModalProvider>
    </LandingProvider>
  );
}
