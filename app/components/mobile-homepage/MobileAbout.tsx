"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileAbout() {
  return (
    <section className="bg-base-100 px-6 pb-8 pt-8">
      <div className="homepage-container flex flex-col gap-6">
        <div className="relative mx-auto h-[405px] w-[324px]">
          <Image
            src="/design/mobile-home/about-olga.png"
            alt="Olga, founder of Olgish Cakes"
            fill
            className="object-cover object-[50%_50%] rounded-[16px]"
            priority
          />
          {/* Decorative top-left corner element */}
          <Image
            src="/design/top_left_corner.png"
            alt=""
            width={79}
            height={59}
            className="absolute top-[-10px] left-[-7px] z-10 pointer-events-none"
          />
          {/* Decorative bottom-right corner element */}
          <Image
            src="/design/bottom_right_corner.png"
            alt=""
            width={79}
            height={59}
            className="absolute top-[352px] right-[-9px] z-10 pointer-events-none"
          />
        </div>

        <div className="rounded-[16px] bg-primary-50 px-4 py-5">
          <p className="font-oldenburg text-[15px] leading-[32px] tracking-[1.2px] text-black text-center">
            Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/cakes" className="flex items-center gap-2 text-base text-black">
              <span className="font-oldenburg">See all cakes</span>
              <span className="font-oldenburg text-primary-500 text-lg">{">"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
