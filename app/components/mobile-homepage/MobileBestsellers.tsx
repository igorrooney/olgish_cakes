"use client";

import Link from "next/link";
import Image from "next/image";

export function MobileBestsellers() {
  return (
    <section className="bg-accent-50 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col gap-6 lg:gap-8">
        <h2 className="font-display text-2xl lg:text-4xl text-primary-700 text-center uppercase tracking-wider leading-10 lg:leading-[40px] lg:tracking-[4.32px]">
          bestsellers
        </h2>
        {/* Mobile: Single card */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="card card-border rounded-box border-primary-50">
            <figure className="relative w-full h-64">
              <Image
                src="https://picsum.photos/342/342"
                alt="Chocolate & Hazelnut Cake"
                fill
                className="object-cover rounded-box"
              />
            </figure>
          </div>
          <div className="flex justify-center">
            <Link
              href="/cakes"
              className="flex items-center gap-1 text-base text-base-content"
            >
              <span className="font-body">Shop bestsellers</span>
              <span className="font-body text-primary-500">{`>`}</span>
            </Link>
          </div>
        </div>
        
        {/* Tablet: Multiple cards with customer stories */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:max-w-5xl lg:mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-80 rounded-box border border-primary-50 overflow-hidden">
              <Image
                src="https://picsum.photos/342/456"
                alt="Cake 1"
                fill
                className="object-cover"
              />
            </div>
            <div className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-5">
              <p className="font-body text-2xl text-base-content mb-2">
                "Customer story, lorem ipsum dolor sit amet consectetur."
              </p>
              <p className="font-body text-base text-base-content mb-2">
                - Who the cake was made for, what occasion etc.
              </p>
              <p className="font-body text-base text-base-content">
                Lorem ipsum dolor sit amet consectetur. Ipsum faucibus nisl pulvinar eget feugiat.
              </p>
            </div>
            <Link
              href="/cakes/chocolate"
              className="flex items-center gap-1 text-xl text-base-content"
            >
              <span className="font-body">Shop chocolate cakes</span>
              <span className="font-body text-primary-500">{`>`}</span>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-80 rounded-box shadow-xl overflow-hidden">
              <Image
                src="https://picsum.photos/342/456"
                alt="Featured Cake"
                fill
                className="object-cover"
              />
            </div>
            <div className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-5">
              <p className="font-body text-2xl text-base-content mb-2">
                "Customer story, lorem ipsum dolor sit amet consectetur."
              </p>
              <p className="font-body text-base text-base-content mb-2">
                - Who the cake was made for, what occasion etc.
              </p>
              <p className="font-body text-base text-base-content">
                Lorem ipsum dolor sit amet consectetur. Ipsum faucibus nisl pulvinar eget feugiat.
              </p>
            </div>
            <Link
              href="/cakes/custom"
              className="flex items-center gap-1 text-xl text-base-content"
            >
              <span className="font-body">Shop custom cakes</span>
              <span className="font-body text-primary-500">{`>`}</span>
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-80 rounded-box shadow-xl overflow-hidden">
              <Image
                src="https://picsum.photos/342/456"
                alt="Cake 3"
                fill
                className="object-cover"
              />
            </div>
            <div className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-5">
              <p className="font-body text-2xl text-base-content mb-2">
                "Customer story, lorem ipsum dolor sit amet consectetur."
              </p>
              <p className="font-body text-base text-base-content mb-2">
                - Who the cake was made for, what occasion etc.
              </p>
              <p className="font-body text-base text-base-content">
                Lorem ipsum dolor sit amet consectetur. Ipsum faucibus nisl pulvinar eget feugiat.
              </p>
            </div>
            <Link
              href="/cakes/birthday"
              className="flex items-center gap-1 text-xl text-base-content"
            >
              <span className="font-body">Shop birthday cakes</span>
              <span className="font-body text-primary-500">{`>`}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

