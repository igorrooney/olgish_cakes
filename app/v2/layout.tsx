import { HeaderV2 } from "../components/new-design/HeaderV2";
import UtilityBar from "../components/UtilityBar";
import Footer from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";
import { WebVitalsMonitor } from "../components/WebVitalsMonitor";
import { DynamicCookieConsent, DynamicDevTools } from "../components/DynamicImports";
import { PerformanceOptimizer } from "../components/PerformanceOptimizer";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UtilityBar />
      <HeaderV2 />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTop />
      <WebVitalsMonitor />
      <PerformanceOptimizer />
      <DynamicCookieConsent />
      <DynamicDevTools />
    </>
  );
}
