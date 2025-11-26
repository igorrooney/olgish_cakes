"use client";

import Link from "next/link";

export function MobileHero() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        {/* Mobile: Simple heading, Tablet: Rotated heading with decorative elements */}
        <div className="relative w-full lg:min-h-[300px] flex items-center justify-center">
          <h1 className="font-display text-2xl lg:text-4xl text-primary-700 text-center uppercase tracking-wider leading-10 lg:leading-[56px] lg:tracking-[7.68px] lg:rotate-[-2.4deg]">
            Handmade Cakes
            <br />
            delivered
            <br />
            <span className="lg:block">to your door from leeds</span>
          </h1>
        </div>
        
        {/* Tablet: Image gallery layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4 lg:relative lg:w-full lg:max-w-4xl lg:mt-8">
          <div className="relative w-full h-64 lg:h-80 rounded-box border border-primary-50 overflow-hidden">
            <img
              src="https://picsum.photos/250/250?random=1"
              alt="Cake 1"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative w-full h-64 lg:h-80 rounded-box border border-primary-50 overflow-hidden">
            <img
              src="https://picsum.photos/250/250?random=2"
              alt="Cake 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative w-full h-64 lg:h-80 rounded-box shadow-xl overflow-hidden">
            <img
              src="https://picsum.photos/300/300?random=3"
              alt="Featured Cake"
              className="w-full h-full object-cover"
            />
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

