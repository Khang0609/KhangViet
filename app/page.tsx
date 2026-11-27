import HeroSection from "@/components/modules/HeroSection";
import IntroSection from "@/components/modules/IntroSection";
import DisciplinesSection from "@/components/modules/DisciplinesSection";
import ProjectShowcase from "@/components/modules/project-showcase/ProjectShowcase";
import Footer from "@/components/modules/Footer";
import { ModalProvider } from "@/components/modals/modalContext";
import { LandingProvider } from "@/components/contexts/LandingContext";
import LazyModalContainer from "@/components/modals/LazyModalContainer";
import { getLandingContent } from "@/lib/landingData";

export default function Home() {
  const landing = getLandingContent();

  return (
    <LandingProvider content={landing}>
      <ModalProvider>
        <div className="min-h-screen bg-(--bg-obsidian) text-(--text-primary)">
          <main>
            <HeroSection />
            <IntroSection />
            <ProjectShowcase />
            <DisciplinesSection />
          </main>

          <Footer />
          <LazyModalContainer />
        </div>
      </ModalProvider>
    </LandingProvider>
  );
}
