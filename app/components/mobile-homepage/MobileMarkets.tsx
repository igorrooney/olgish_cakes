"use client";

import Image from "next/image";
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
    <section className="relative bg-base-100 px-4 py-8">
      <div className="absolute left-0 right-0 top-0 h-[78px]">
        <Image src="/design/mobile-home/wave-intersect.png" alt="" fill className="object-cover" />
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-[78px] rotate-180">
        <Image src="/design/mobile-home/wave-intersect.png" alt="" fill className="object-cover" />
      </div>

      <div className="relative mx-auto flex max-w-[390px] flex-col gap-6">
        <h2 className="mt-10 font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
          Upcoming
          <br />
          Farmers markets
        </h2>

        <div className="flex flex-col gap-5 rounded-[16px] bg-accent-50 px-4 py-6 shadow-sm">
          {markets.map((market, index) => (
            <div
              key={index}
              className="rounded-[16px] border border-[rgba(0,0,0,0.2)] bg-amber-50 px-5 py-6 shadow-xl"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-moreSugar text-[20px] text-base-content leading-[28px]">
                  {market.name}
                </h3>
                <div className="flex flex-col gap-1 font-sans text-sm text-base-content">
                  <p>{market.date}</p>
                  <p>{market.time}</p>
                  <p>{market.location}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="#"
                    className="btn h-8 rounded-full border border-primary-500 px-3 text-sm text-primary-500"
                  >
                    Get directions -&gt;
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <Link href="/farmers-markets" className="text-sm underline text-primary-500">
              Visit website
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

