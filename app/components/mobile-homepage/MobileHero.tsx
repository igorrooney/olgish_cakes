"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileHero() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        {/* Mobile: Simple heading, Tablet: Rotated heading with decorative elements */}
        <div className="relative w-full lg:min-h-[300px] flex items-center justify-center">
          {/* Decorative Elements */}
          {/* Light purple star - near heading */}
          <svg className="absolute top-2 right-[45%] w-6 h-6 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D8B4FE" opacity="0.6" />
          </svg>

          {/* Light blue wavy line - top right */}
          <svg className="absolute top-0 right-4 w-16 h-8 lg:w-24 lg:h-12" viewBox="0 0 64 32" fill="none">
            <path d="M0 16C8 8 16 8 24 16C32 24 40 24 48 16C56 8 56 8 64 16" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </svg>

          {/* Light orange wavy line - middle right */}
          <svg className="absolute top-1/3 right-2 w-12 h-8 lg:w-20 lg:h-12" viewBox="0 0 48 32" fill="none">
            <path d="M0 16C6 8 12 8 18 16C24 24 30 24 36 16C42 8 42 8 48 16" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </svg>

          {/* Light purple C-shape - middle left */}
          <svg className="absolute top-1/2 left-4 w-10 h-10 lg:w-16 lg:h-16" viewBox="0 0 40 40" fill="none">
            <path d="M30 8C24 8 18 14 18 20C18 26 24 32 30 32" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </svg>

          {/* Light orange wavy line - bottom left */}
          <svg className="absolute bottom-2 left-8 w-14 h-6 lg:w-20 lg:h-10" viewBox="0 0 56 24" fill="none">
            <path d="M0 12C7 6 14 6 21 12C28 18 35 18 42 12C49 6 49 6 56 12" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          </svg>

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
          <div className="relative w-full h-48 lg:h-[480px] flex items-center justify-center">
            {/* Left: White cake with chocolate drizzle - 28% width, shorter height */}
            <div className="absolute left-0 w-[28%] h-32 lg:h-80 rounded-box border border-primary-50 overflow-hidden z-10">
              <Image
                src="/images/placeholder-cake.jpg"
                alt="White cake with dark chocolate drizzle and chocolate pieces"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 28vw, 280px"
                priority
              />
            </div>

            {/* Middle: Dark chocolate cake - 55% width, much taller, overlapping both sides */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[55%] h-48 lg:h-[480px] rounded-box border border-primary-50 overflow-hidden z-30 shadow-xl">
              <Image
                src="/images/placeholder-cake.jpg"
                alt="Dark chocolate cake with golden Christmas tree design"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 55vw, 550px"
                priority
              />

              {/* HANDCRAFTED CAKES Badge - positioned in upper right of middle image */}
              <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 z-40">
                <svg className="w-16 h-16 lg:w-24 lg:h-24" viewBox="0 0 100 100">
                  {/* Jagged circle background */}
                  <path d="M50 5 L52 15 L55 5 L57 15 L60 5 L62 15 L65 7 L67 17 L70 9 L72 19 L75 12 L77 22 L80 15 L82 25 L85 20 L87 30 L89 25 L91 35 L92 31 L93 41 L94 38 L94 48 L95 46 L94 56 L94 54 L93 64 L92 62 L91 72 L89 70 L87 80 L85 78 L82 85 L80 83 L77 88 L75 86 L72 90 L70 88 L67 92 L65 90 L62 93 L60 91 L57 94 L55 92 L52 95 L50 93 L48 95 L45 92 L43 94 L40 91 L38 93 L35 90 L33 92 L30 88 L28 90 L25 86 L23 88 L20 83 L18 85 L15 78 L13 80 L11 70 L9 72 L8 62 L7 64 L6 54 L6 56 L5 46 L6 48 L7 38 L8 41 L9 31 L11 35 L13 25 L15 30 L18 20 L20 25 L23 15 L25 22 L28 12 L30 19 L33 9 L35 17 L38 7 L40 15 L43 5 L45 15 L48 5 Z"
                    fill="#FFE5CC"
                    stroke="#FF9966"
                    strokeWidth="2"
                  />
                  {/* Text */}
                  <text x="50" y="45" textAnchor="middle" className="text-[9px] lg:text-[11px] font-sans font-bold" fill="#D97706">HANDCRAFTED</text>
                  <text x="50" y="58" textAnchor="middle" className="text-[9px] lg:text-[11px] font-sans font-bold" fill="#D97706">CAKES</text>
                </svg>
              </div>
            </div>

            {/* Right: Colorful cake with sprinkles - 28% width, shorter height */}
            <div className="absolute right-0 w-[28%] h-32 lg:h-80 rounded-box border border-primary-50 overflow-hidden z-10">
              <Image
                src="/images/placeholder-cake.jpg"
                alt="Colorful cake with various sprinkles and candies"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 28vw, 280px"
                priority
              />
            </div>
          </div>
        </div>

        {/* Body Text */}
        <div className="flex flex-col gap-4 text-center lg:gap-6 lg:max-w-4xl px-2">
          <p className="font-oldenburg text-base lg:text-2xl tracking-[0.12em] leading-[22px] flex items-center justify-center text-primary-800">
            Small-batch, hand-decorated cakes baked in Leeds.
          </p>
          <p className="font-oldenburg text-base lg:text-2xl tracking-[0.12em] leading-[22px] flex items-center justify-center text-primary-800">
            Delivered nationwide by post, or brought to your door across Leeds and West Yorkshire.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col gap-4 w-full lg:flex-row lg:gap-4 lg:max-w-4xl lg:justify-center">
          <Link
            href="/cakes"
            className="btn btn-primary flex items-center justify-center gap-2 h-12 lg:h-16 px-4 lg:px-6 rounded-full! font-sans text-sm lg:text-lg font-semibold shadow-btn transition-colors lg:flex-1 lg:max-w-[424px]"
          >
            <span>Shop cakes by post</span>
            <svg
              className="size-[1.2em]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.6 4.8M17 13l1.6 4.8M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
          </Link>
          <Link
            href="/custom-cakes"
            className="flex items-center justify-center h-12 lg:h-16 px-4 lg:px-6 rounded-full font-sans text-sm lg:text-lg font-semibold transition-colors lg:flex-1 lg:max-w-[424px] bg-[#FFF5E6] border-2 border-[#2E3192] text-[#2E3192]"
          >
            <span>Custom cake enquiry form</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

