
import {
  MobileHeader,
  MobileHero,
  MobileAbout,
  MobileBestsellers,
  MobileMarkets,
  MobileReviews,
  MobileOccasions,
  MobileForm,
  MobileFooter,
} from "./components/mobile-homepage";

export default async function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      <MobileHeader />
      <main className="flex flex-col">
        <MobileHero />
        <MobileAbout />
        <MobileBestsellers />
        <MobileMarkets />
        <MobileReviews />
        <MobileOccasions />
        <MobileForm />
      </main>
      <MobileFooter />
    </div>
  );
}