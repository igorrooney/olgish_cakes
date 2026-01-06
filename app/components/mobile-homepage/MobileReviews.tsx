"use client";

interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
}

const reviews: Review[] = [
  {
    rating: 5,
    text: "The BEST cake ever!! I love this product because the support is great. Please ...",
    author: "Jamie S.",
    date: "2 days ago",
  },
];

const allReviews: Review[] = [
  {
    rating: 5,
    text: "The BEST cake ever!! I love this product because the support is great. Please ...",
    author: "Jamie S.",
    date: "2 days ago",
  },
  {
    rating: 5,
    text: "Service with a smile. Olga's attention to detail was amazing and we got our cake in perfect time for...",
    author: "Jane S.",
    date: "3 days ago",
  },
  {
    rating: 5,
    text: "We visited the Farmers Market! Such a lovely stall. Thank you so much for the freebie!",
    author: "Oscar B.",
    date: "4 days ago",
  },
  {
    rating: 5,
    text: "It tasted sooo good. We had a 3 tier chocolate sponge cake and wow, unreal. We ate every last bite...",
    author: "John S.",
    date: "9 days ago",
  },
];

export function MobileReviews() {
  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="mx-auto flex max-w-[390px] flex-col gap-6">
        <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
          Our reviews
        </h2>

        <div className="flex flex-col gap-5">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-[16px] border border-[rgba(0,0,0,0.2)] bg-amber-50 p-5 shadow-[0px_2px_4px_rgba(7,4,146,0.1),0px_24px_60px_rgba(6,47,125,0.05),0px_12px_24px_rgba(27,59,119,0.05)]"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="rating rating-sm">
                    {[...Array(5)].map((_, i) => (
                      <input
                        key={i}
                        type="radio"
                        name={`rating-${index}`}
                        className="mask mask-star-2 bg-success-500"
                        checked={i < review.rating}
                        readOnly
                      />
                    ))}
                  </div>
                  <span className="font-sans text-xs text-base-content">
                    {review.date}
                  </span>
                </div>
                <h3 className="font-sans text-lg font-medium text-base-content">
                  The BEST cake ever!!
                </h3>
                <p className="font-sans text-sm text-base-content leading-[22px]">
                  {review.text}
                </p>
                <div className="h-px w-[60px] bg-base-300" />
                <p className="font-sans text-sm font-bold text-base-content">
                  {review.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-base-300">
            <span className="text-primary-500 text-base leading-none">{"<"}</span>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-base-300">
            <span className="text-primary-500 text-base leading-none">{">"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

