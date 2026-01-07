"use client";

import Image from "next/image";
import Link from "next/link";

export function MobileHero() {
  return (
    <section className="bg-base-100 px-4 pt-6 pb-8 overflow-hidden">
      <div className="relative mx-auto flex max-w-[430px] flex-col items-center gap-6">
        <div className="relative flex w-full flex-col items-center justify-center">
          <h1 className="mt-2 font-moreSugar text-center text-[24px] uppercase tracking-[0.16em] text-primary-700 rotate-[-2.4deg] leading-[40px]">
            Handmade Cakes
            <br />
            delivered
            <br />
            to your door from leeds
          </h1>
        </div>

        <div className="relative h-[178px] w-[350px] max-w-full">
          <div className="absolute left-0 top-[22px] h-[142px] w-[142px] rounded-[16px] border border-primary-50 overflow-hidden shadow-sm">
            <Image
              src="/design/mobile-home/hero-left.png"
              alt="Birthday cake with chocolate drizzle"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute left-1/2 top-0 h-[169px] w-[169px] rounded-[16px] border border-primary-50 overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.25)] -translate-x-1/2 translate-y-[6px] z-[1]">
            <Image
              src="/design/mobile-home/hero-main.png"
              alt="Signature Olgish cake"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute right-0 top-[22px] h-[142px] w-[142px] rounded-[16px] border border-primary-50 overflow-hidden shadow-sm">
            <Image
              src="/design/mobile-home/hero-right.png"
              alt="Honey cake (Medovik)"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute right-[-10px] top-[0px] h-12 w-12">
            <Image
              src="/design/mobile-home/hero-doodles.png"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-2 text-center">
          <p className="font-oldenburg text-base leading-[22px] tracking-[1.92px] text-primary-800 font-normal">
            Small-batch, hand-decorated cakes baked in Leeds.
          </p>
          <p className="font-oldenburg text-base leading-[22px] tracking-[1.92px] text-primary-800 font-normal">
            Delivered nationwide by post, or brought to your door across Leeds and West Yorkshire.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/cakes"
            className="btn btn-primary btn-block gap-2 text-sm font-semibold"
          >
            Shop cakes by post
            <svg width="16" height="16" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 0.5C0 0.223858 0.223858 0 0.5 0H1.42379C1.9901 0 2.48567 0.380725 2.63159 0.92792L2.78579 1.50617C3.02337 1.50206 3.26145 1.5 3.5 1.5C6.96908 1.5 10.337 1.93628 13.5515 2.75722C13.6862 2.79162 13.8005 2.88055 13.867 3.00266C13.9335 3.12478 13.9461 3.26905 13.9018 3.40084C13.3455 5.05735 12.6851 6.66602 11.9283 8.21903C11.8445 8.39093 11.6701 8.5 11.4788 8.5H4C3.34689 8.5 2.79127 8.9174 2.58535 9.5H12.5C12.7761 9.5 13 9.72386 13 10C13 10.2761 12.7761 10.5 12.5 10.5H2C1.72386 10.5 1.5 10.2761 1.5 10C1.5 8.83672 2.29452 7.85901 3.37051 7.57992L1.92081 2.14356L1.92081 2.14356L1.66535 1.18558L1.66535 1.18558C1.63617 1.07615 1.53706 1 1.42379 1H0.5C0.223858 1 0 0.776142 0 0.5ZM3.05147 2.50249L4.38414 7.5H11.1649C11.7693 6.23424 12.3084 4.9313 12.7776 3.59553C9.80255 2.87945 6.69591 2.5 3.5 2.5C3.35029 2.5 3.20078 2.50083 3.05147 2.50249ZM1.5 12C1.5 11.4477 1.94772 11 2.5 11C3.05228 11 3.5 11.4477 3.5 12C3.5 12.5523 3.05228 13 2.5 13C1.94772 13 1.5 12.5523 1.5 12ZM10 12C10 11.4477 10.4477 11 11 11C11.5523 11 12 11.4477 12 12C12 12.5523 11.5523 13 11 13C10.4477 13 10 12.5523 10 12Z" fill="white" />
            </svg>
          </Link>
          <Link
            href="/get-custom-quote"
            className="btn btn-outline btn-block border-primary-500 bg-base-100 text-primary-500 shadow-btn text-sm font-semibold leading-[14px]"
          >
            Custom cake enquiry form
          </Link>
        </div>
      </div>
    </section>
  );
}

