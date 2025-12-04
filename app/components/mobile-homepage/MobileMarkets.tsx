"use client";

import Link from "next/link";

interface MarketEvent {
  name: string;
  date: string;
  time: string;
  location: string;
  website?: string;
}

const markets: MarketEvent[] = [
  {
    name: "Rothwell Farmers Market",
    date: "Sunday 30 November",
    time: "10:00-14:00",
    location: "The White Swan, Church St, Rothwell, Leeds LS26 0QL",
  },
  {
    name: "Jacobs Local Market",
    date: "Friday 5 December",
    time: "9:00-14:00",
    location: "The Black Swan, Portland St, City Centre, Leeds LS01 2LP",
  },
];

export function MobileMarkets() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col gap-6 lg:gap-8">
        <h2 className="font-display text-2xl lg:text-4xl text-primary-700 text-center uppercase tracking-wider leading-10 lg:leading-[40px] lg:tracking-[4.32px]">
          <span className="lg:block">Upcoming</span>
          <span className="lg:block">Farmers markets</span>
        </h2>
        {/* Mobile: Vertical stack */}
        <div className="flex flex-col gap-6 lg:hidden">
          {markets.map((market, index) => (
            <div
              key={index}
              className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-8"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl text-base-content">
                  {market.name}
                </h3>
                <div className="flex flex-col gap-1 font-sans text-sm text-base-content">
                  <p>{market.date}</p>
                  <p>{market.time}</p>
                  <p>{market.location}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Link
                    href="#"
                    className="btn btn-outline border-primary-500 text-primary-500 rounded-full px-3 h-8 text-sm"
                  >
                    Get directions →
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <Link
              href="/farmers-markets"
              className="link link-primary text-sm underline"
            >
              Visit website
            </Link>
          </div>
        </div>
        
        {/* Tablet: 2-column grid */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-3xl lg:mx-auto">
          {markets.map((market, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-8">
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-xl text-base-content">
                    {market.name}
                  </h3>
                  <div className="flex flex-col gap-1 font-sans text-sm text-base-content">
                    <p>{market.date}</p>
                    <p>{market.time}</p>
                    <p>{market.location}</p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Link
                      href="#"
                      className="btn btn-outline border-primary-500 text-primary-500 rounded-full px-3 h-8 text-sm"
                    >
                      Get directions →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Link
                  href="/farmers-markets"
                  className="link link-primary text-sm underline"
                >
                  Visit website
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

