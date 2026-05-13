import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickServiceSplit from "@/components/QuickServiceSplit";
import TrustStrip from "@/components/TrustStrip";
import TransportationServicesSection from "@/components/TransportationServicesSection";
import Services from "@/components/Services";
import WhyChoose from "@/components/WhyChoose";
import VehicleComfort from "@/components/VehicleComfort";
import FamilyCarSeats from "@/components/FamilyCarSeats";
import { SITE_IMAGES } from "@/lib/siteImages";
import Testimonials from "@/components/Testimonials";
import LAHighlights from "@/components/LAHighlights";
import HowItWorks from "@/components/HowItWorks";
import ServiceArea from "@/components/ServiceArea";
import FAQ from "@/components/FAQ";
import ContactSection from "@/components/ContactSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        {/* 1. Hero — Anaheim's Premier Tours & Transportation */}
        <Hero />
        {/* 2. Quick service split — Transportation vs Tour */}
        <QuickServiceSplit />
        {/* 3. Social proof bridge — keeps trust forward of services */}
        <TrustStrip />
        {/* 4. Transportation services — the new offering */}
        <TransportationServicesSection />
        {/* 5. Tours — existing offering on Peek */}
        <Services />
        {/* 6. Why choose — combined positioning */}
        <WhyChoose />
        {/* 7. Family-friendly — free car seats showcase. Placed right after
            Why Choose because family-friendly is one of those bullets, and
            seeing it as a full visual section right after the abbreviated
            mention amplifies it. Photos are placeholders from Pexels/Unsplash;
            swap with real fleet photos when available. */}
        <FamilyCarSeats
          photos={[
            { src: SITE_IMAGES.carSeatInfant, alt: "Infant car seat installed in TNT Tours vehicle" },
            { src: SITE_IMAGES.carSeatParentInstalling, alt: "Parent securing a baby in the car seat before pickup" },
            { src: SITE_IMAGES.carSeatProduct, alt: "Forward-facing child seat with safety harness, installed in the rear seat" },
            { src: SITE_IMAGES.carSeatBooster, alt: "Child smiling in a high-back booster seat during a TNT ride" },
          ]}
        />
        {/* 8. Vehicle comfort — relevant to both services */}
        <VehicleComfort />
        {/* 8. Testimonials */}
        <Testimonials />
        {/* 9. LA highlights — destination inspiration */}
        <LAHighlights />
        {/* 10. How it works — booking simplicity */}
        <HowItWorks />
        {/* 11. Service area — geographic reach */}
        <ServiceArea />
        {/* 12. FAQ */}
        <FAQ />
        {/* 13. Contact form */}
        <ContactSection />
        {/* 14. Final CTA — conversion push */}
        <FinalCTA />
      </main>
      <Footer />
      <MobileCTA />
      <BackToTop />
    </>
  );
}
