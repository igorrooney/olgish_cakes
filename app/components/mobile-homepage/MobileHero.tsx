"use client";

import Link from "next/link";
import Image from "next/image";

export function MobileHero() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        {/* Mobile: Simple heading, Tablet: Rotated heading with decorative elements */}
        <div className="relative w-full lg:min-h-[300px] flex items-center justify-center">
          <h1 className="hero-heading font-moreSugar text-center uppercase tracking-[0.16em] rotate-[-2.4deg] text-primary-700 font-normal">
            Handmade Cakes
            <br />
            delivered
            <br />
            to your door from leeds
          </h1>
        </div>
        
        {/* Mobile & Tablet: Image gallery layout with overlapping middle image */}
        <div className="relative w-full lg:max-w-4xl flex items-center justify-center">
          <div className="relative w-full h-32 lg:h-80 flex items-center justify-center">
            {/* Left: White cake with chocolate drizzle */}
            <div className="absolute left-0 w-1/3 h-32 lg:h-80 rounded-box border border-primary-50 overflow-hidden z-10">
              <Image
                src="https://picsum.photos/250/250?random=1"
                alt="White cake with dark chocolate drizzle and chocolate pieces"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 33vw, 300px"
              />
            </div>
            {/* Middle: Dark chocolate cake with golden Christmas tree - overlapping half of each side */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1/3 h-32 lg:h-80 rounded-box border border-primary-50 overflow-hidden z-20 shadow-xl">
              <Image
                src="https://picsum.photos/250/250?random=2"
                alt="Dark chocolate cake with golden Christmas tree design"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 33vw, 300px"
              />
            </div>
            {/* Right: Colorful cake with sprinkles */}
            <div className="absolute right-0 w-1/3 h-32 lg:h-80 rounded-box border border-primary-50 overflow-hidden z-10">
              <Image
                src="https://picsum.photos/300/300?random=3"
                alt="Colorful cake with various sprinkles and candies"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 33vw, 300px"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-center lg:gap-6 lg:max-w-4xl">
          <p className="font-body text-base lg:text-2xl text-primary-800 tracking-wide leading-[22px] lg:leading-[22px] lg:tracking-[2.88px]">
            Small-batch, hand-decorated cakes baked in Leeds.
          </p>
          <p className="font-body text-base lg:text-2xl text-primary-800 tracking-wide leading-[22px] lg:leading-[22px] lg:tracking-[2.88px]">
            Delivered nationwide by post, or brought to your door across Leeds and West Yorkshire.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-4 gap-4 w-full lg:max-w-4xl lg:justify-center">
          <Link
            href="/cakes"
            className="btn btn-primary bg-primary-500 text-white rounded-full px-4 h-12 lg:h-16 lg:px-4 shadow-btn flex items-center justify-center gap-2 lg:flex-1 lg:max-w-[424px]"
          >
            <span className="font-sans text-sm lg:text-lg font-semibold">Shop cakes by post</span>
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/custom-cakes"
            className="btn btn-outline border-primary-500 text-primary-500 rounded-full px-4 h-12 lg:h-16 lg:px-4 flex items-center justify-center lg:flex-1 lg:max-w-[424px]"
          >
            <span className="font-sans text-sm lg:text-lg font-semibold">Custom cake enquiry form</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

