"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileBestsellers() {
  return (
    <section className="bg-accent-50 px-4 py-8">
      <div className="mx-auto flex max-w-[390px] flex-col gap-6">
        <div className="flex justify-center">
          <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
            our bestsellers
          </h2>
        </div>

        <div className="relative h-[342px] w-full rounded-[16px] border border-primary-50 overflow-hidden shadow-xl">
          <Image
            src="/design/mobile-home/bestseller-main.png"
            alt="Chocolate delicia cake"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute right-3 top-3 h-10 w-10">
            <Image
              src="/design/mobile-home/bestseller-sticker.png"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative h-[342px] w-full rounded-[16px] border border-primary-50 overflow-hidden shadow-md">
          <Image
            src="/design/mobile-home/bestseller-secondary.png"
            alt="Second bestselling cake"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex justify-center">
          <Link
            href="/cakes"
            className="flex items-center gap-2 text-base text-base-content"
          >
            <span className="font-oldenburg">Shop bestsellers</span>
            <span className="font-oldenburg text-primary-500 text-lg">{">"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

