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
import { getLandingContent } from "@/services/contentService";

export default async function Home() {
  const landing = await getLandingContent();

  return (
    <ModalProvider>
      <div className="min-h-screen bg-(--bg-obsidian) text-(--text-primary)">
        <Header />

        <main id="top">
          <HeroSection slides={landing.heroSlides} />
          <TrustMarquee brands={landing.partnerBrands} />
          <DisciplinesSection disciplines={landing.coreDisciplines} />
          <ProjectShowcase projects={landing.featuredProjects} />
          <InHouseEngineering
            divisions={landing.productionDivisions}
            legalInfo={landing.companyLegalInfo}
          />
          <ContactDualGates />
        </main>

        <Footer legalInfo={landing.companyLegalInfo} />
        <LazyModalContainer />
      </div>
    </ModalProvider>
  );
}
