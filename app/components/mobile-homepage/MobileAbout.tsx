"use client";

import Link from "next/link";
import Image from "next/image";

export function MobileAbout() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Mobile: Simple card */}
        <div className="bg-primary-50 rounded-box p-5 opacity-87 lg:hidden">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl text-primary-500 text-center uppercase tracking-wider">
              Meet Olgish
            </h2>
            <p className="font-body text-sm text-base-content text-center leading-7 tracking-wide">
              Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
            </p>
          </div>
        </div>
        
        {/* Tablet: Image + text side by side with navigation links */}
        <div className="hidden lg:flex lg:gap-8 lg:items-start lg:max-w-5xl lg:mx-auto">
          <div className="flex-shrink-0">
            <div className="relative w-80 h-[550px] rounded-box overflow-hidden">
              <Image
                src="https://picsum.photos/440/550?random=profile"
                alt="Olga"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-primary-50 rounded-box p-8 opacity-95">
              <p className="font-body text-base text-base-content leading-7">
                Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
                <br />
                <br />
                Add paragraph
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <Link
                href="/cakes"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">See all cakes</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/cakes/bestsellers"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">View bestsellers</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/farmers-markets"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">Visit our market stall</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/reviews"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">Check our reviews</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/occasions"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">Browse occasion cakes</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/custom-cakes"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">Custom cake enquiry</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
              <Link
                href="/instagram"
                className="flex items-center gap-1 text-xl text-base-content"
              >
                <span className="font-body">Follow our instagram</span>
                <span className="font-body text-primary-500 text-2xl">{`>`}</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center lg:hidden">
          <Link
            href="/cakes"
            className="flex items-center gap-1 text-base text-base-content"
          >
            <span className="font-body">See all cakes</span>
            <span className="font-body text-primary-500">{`>`}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

