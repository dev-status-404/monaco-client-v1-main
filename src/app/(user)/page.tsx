import Container from "@/components/common/container";
import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import GradientShell from "@/components/layout/gradient-scroll";
import FeatureGrid from "@/components/layout/marketing/feature-grid";
import GameStrip from "@/components/layout/marketing/game-strip";
import GamingPartnersSection from "@/components/layout/marketing/gaming-partnership";
import Hero from "@/components/layout/marketing/hero";
import HowToPlay from "@/components/layout/marketing/how-to-play";
import JoinCta from "@/components/layout/marketing/join-cta";
import LatestWinners from "@/components/layout/marketing/latest_winners";
import PartnerProgramCard from "@/components/layout/marketing/partnership-program";

export default function Page() {
  return (
    <GradientShell>
      <main className="w-full bg-transparent">
        <Container className="py-6 bg-transparent">
          <Header />
          <div className="mt-10" />
          <Hero />
          <div className="mt-10" />
          <FeatureGrid />
          <div className="mt-10" />
          <JoinCta />
          <div className="mt-8" />
          <LatestWinners />
          <div className="mt-10" />
          <GamingPartnersSection />
          <div className="mt-10" />
          <PartnerProgramCard />
          <div className="mt-10" />
          <Footer />
        </Container>
      </main>
    </GradientShell>
  );
}
