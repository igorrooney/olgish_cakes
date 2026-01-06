"use client";

import Image from "next/image";

const occasions = [
  { name: "Kids Birthdays", image: "/design/mobile-home/occasions-kids.png" },
  { name: "Adult Birthdays", image: "/design/mobile-home/occasions-adults.png" },
  { name: "Christmas", image: "/design/mobile-home/occasions-christmas.png" },
  { name: "Anniversaries", image: "/design/mobile-home/occasions-anniversaries.png" },
  { name: "Ukrainian", image: "/design/mobile-home/occasions-ukrainian.png" },
  { name: "Custom cakes", image: "/design/mobile-home/occasions-custom.png" },
];

export function MobileOccasions() {
  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="relative mx-auto flex max-w-[390px] flex-col gap-6">
        <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
          Cakes for any occasion
        </h2>
        <div className="absolute right-2 top-10 h-12 w-10">
          <Image
            src="/design/mobile-home/occasions-sticker.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {occasions.map((occasion) => (
            <div key={occasion.name} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-24 rounded-[16px] border border-primary-50 overflow-hidden">
                <Image
                  src={occasion.image}
                  alt={occasion.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-oldenburg text-xs text-base-content text-center leading-[15px]">
                {occasion.name}
              </p>
            </div>
          ))}
        </div>
        <p className="font-oldenburg text-[24px] text-base-content text-center">
          + many more!
        </p>
      </div>
    </section>
  );
}

