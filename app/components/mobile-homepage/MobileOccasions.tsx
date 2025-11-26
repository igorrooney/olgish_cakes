"use client";

import Image from "next/image";

const occasions = [
  { name: "Kids Birthdays", image: "https://picsum.photos/98/98?random=1" },
  { name: "Adult Birthdays", image: "https://picsum.photos/98/98?random=2" },
  { name: "Christmas", image: "https://picsum.photos/98/98?random=3" },
  { name: "Anniversaries", image: "https://picsum.photos/98/98?random=4" },
  { name: "Ukrainian", image: "https://picsum.photos/98/98?random=5" },
  { name: "Custom cakes", image: "https://picsum.photos/98/98?random=6" },
];

export function MobileOccasions() {
  return (
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col gap-6 lg:gap-8">
        <h2 className="font-display text-2xl lg:text-4xl text-primary-700 text-center uppercase tracking-wider leading-10 lg:leading-[40px] lg:tracking-[4.32px]">
          <span className="lg:block">Cakes for any </span>
          <span className="lg:block">occasion</span>
        </h2>
        <div className="grid grid-cols-3 gap-4 lg:gap-6 lg:max-w-2xl lg:mx-auto">
          {occasions.map((occasion, index) => (
            <div key={index} className="flex flex-col items-center gap-1 lg:gap-2">
              <div className="relative w-24 h-24 lg:w-56 lg:h-56 rounded-box border border-primary-50 overflow-hidden">
                <Image
                  src={occasion.image}
                  alt={occasion.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-body text-xs lg:text-base text-base-content text-center">
                {occasion.name}
              </p>
            </div>
          ))}
        </div>
        <p className="font-body text-2xl lg:text-2xl text-base-content text-center lg:mt-4">
          + many more!
        </p>
      </div>
    </section>
  );
}

