"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileAbout() {
  return (
    <section className="bg-base-100 px-4 pb-8 pt-4">
      <div className="mx-auto flex max-w-[390px] flex-col gap-6">
        <div className="relative h-[405px] w-full overflow-hidden rounded-[16px]">
          <Image
            src="/design/mobile-home/about-olga.png"
            alt="Olga, founder of Olgish Cakes"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute left-2 top-2 h-12 w-12">
            <Image
              src="/design/mobile-home/about-sticker.png"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute right-4 bottom-4 h-12 w-12 opacity-90">
            <Image
              src="/design/mobile-home/about-sticker.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="rounded-[16px] bg-primary-50 px-4 py-5">
          <p className="font-oldenburg text-[15px] leading-[32px] tracking-[0.08em] text-base-content text-center">
            Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/cakes" className="flex items-center gap-2 text-base text-base-content">
              <span className="font-oldenburg">See all cakes</span>
              <span className="font-oldenburg text-primary-500 text-lg">{">"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

