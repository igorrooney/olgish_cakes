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
    <section className="bg-base-100 px-6 py-8 lg:px-20 lg:py-12">
      <div className="flex flex-col gap-6 lg:gap-8">
        <h2 className="font-display text-2xl lg:text-4xl text-primary-700 text-center uppercase tracking-wider leading-10 lg:leading-[40px] lg:tracking-[4.32px]">
          Our reviews
        </h2>
        {/* Mobile: Single review */}
        <div className="flex flex-col gap-6 lg:hidden">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-5"
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
                  {review.text.split(" ").slice(0, 4).join(" ")}
                </h3>
                <p className="font-sans text-sm text-base-content">
                  {review.text}
                </p>
                <div className="divider my-1 h-px bg-base-300 w-15"></div>
                <p className="font-sans text-sm font-bold text-base-content">
                  {review.author}
                </p>
              </div>
            </div>
          ))}
          <div className="flex justify-center gap-2">
            <button className="btn btn-circle btn-sm bg-base-300 border-none">
              <svg
                className="w-5 h-5 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="btn btn-circle btn-sm bg-base-300 border-none">
              <svg
                className="w-5 h-5 text-primary-500"
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
            </button>
          </div>
        </div>
        
        {/* Tablet: 2-column grid */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:max-w-3xl lg:mx-auto">
          {allReviews.map((review, index) => (
            <div
              key={index}
              className="card bg-base-100 border border-base-content border-opacity-20 rounded-box p-5"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="rating rating-sm">
                    {[...Array(5)].map((_, i) => (
                      <input
                        key={i}
                        type="radio"
                        name={`rating-tablet-${index}`}
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
                  {review.text.split(" ").slice(0, 4).join(" ")}
                </h3>
                <p className="font-sans text-sm text-base-content">
                  {review.text}
                </p>
                <div className="divider my-1 h-px bg-base-300 w-15"></div>
                <p className="font-sans text-sm font-bold text-base-content">
                  {review.author}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:flex lg:justify-center lg:gap-4 lg:mt-4">
          <button className="btn btn-circle btn-sm bg-base-300 border-none">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="btn btn-circle btn-sm bg-base-300 border-none">
            <svg
              className="w-5 h-5 text-primary-500"
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
          </button>
        </div>
      </div>
    </section>
  );
}

