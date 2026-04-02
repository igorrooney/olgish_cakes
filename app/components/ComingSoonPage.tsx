import Link from "next/link";
import type { ComingSoonPageContent } from "@/lib/coming-soon-pages";

export function ComingSoonPage({ page }: { page: ComingSoonPageContent }) {
  return (
    <main className="min-h-screen bg-base-100 text-base-content [font-family:var(--font-inter)]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-20 pt-8 tablet:px-10 tablet:pt-12">
        <section className="grid gap-8 small-laptop:grid-cols-[minmax(0,1.1fr)_320px] small-laptop:items-end">
          <div className="space-y-5">
            <p className="font-moreSugar text-sm uppercase tracking-[0.18em] text-primary-500">
              {page.eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="max-w-[18ch] font-oldenburg text-[42px] leading-none tracking-[0.02em] text-primary-800 tablet:text-[56px]">
                {page.title}
              </h1>
              <p className="max-w-[62ch] font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/84 tablet:text-[21px]">
                {page.description}
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-base-300 bg-white p-6 shadow-sm">
            <p className="font-oldenburg text-[26px] leading-tight tracking-[0.03em] text-primary-800">
              Coming soon
            </p>
            <p className="mt-4 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/82 tablet:text-[17px]">
              {page.body}
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-base-300 bg-white p-6 shadow-sm tablet:p-8">
          <div className="max-w-[50rem] space-y-3">
            <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
              What you can do now
            </p>
            <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
              Useful links while this page is being finished
            </h2>
          </div>
          <ul className="mt-6 space-y-3 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/78 tablet:text-[17px]">
            {page.bullets.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {page.links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.variant === "primary"
                    ? "btn btn-primary rounded-full px-5 normal-case shadow-none"
                    : "btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
