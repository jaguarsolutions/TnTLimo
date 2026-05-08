import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TransportationBookingWizard from "@/components/transportation/TransportationBookingWizard";

export default function TransportationBookPage() {
  return (
    <>
      <Header solid />
      <main className="bg-cream text-ink pt-20 md:pt-24">
        {/* useSearchParams in the wizard requires a Suspense boundary so the
            page can prerender while the wizard hydrates with the query. */}
        <Suspense fallback={null}>
          <TransportationBookingWizard />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
