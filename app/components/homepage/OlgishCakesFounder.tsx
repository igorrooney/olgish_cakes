import Image from 'next/image'
import Link from 'next/link'

export function OlgishCakesFounder() {
  const linkClassName =
    'flex items-center gap-2 font-oldenburg text-base text-base-content transition-colors hover:text-primary-500 tablet:text-[20px] tablet:leading-[20px] tablet:tracking-normal tablet:font-normal'
  const arrowClassName = 'font-oldenburg text-primary-500 text-lg'

  return (
    <section className='bg-base-100 px-6 pb-8 pt-8 tablet:px-10 tablet:pt-10 tablet:pb-12'>
      <div className='homepage-container flex flex-col gap-6 tablet:gap-10 tablet:max-w-[863px] tablet:relative tablet: left-[-160px]'>
        <div className='flex flex-col gap-6 tablet:flex-row tablet:items-center tablet:justify-center tablet:gap-5'>
          <div className='order-2 relative rounded-[16px] bg-primary-50 px-4 py-5 text-center shadow-xl tablet:order-1 tablet:flex tablet:flex-col tablet:justify-center tablet:h-[306px] tablet:w-[269px] tablet:-mr-[134px] tablet:px-5 tablet:py-6 tablet:text-left tablet:shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)] tablet:z-10'>
            <div className='space-y-4'>
              <p className='font-oldenburg text-[15px] leading-[32px] tracking-[1.2px] text-base-content tablet:text-base tablet:leading-7 tablet:tracking-normal tablet:text-center tablet:font-normal tablet:align-middle'>
                Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
              </p>
              <p className='font-oldenburg text-[15px] leading-[32px] tracking-[1.2px] text-base-content tablet:hidden'>
                Now based in Leeds, she bakes in small batches so every order feels personal, warm, and made just for you.
              </p>
            </div>
            <div className='mt-4 flex justify-center tablet:hidden'>
              <Link href='/cakes' className={linkClassName}>
                <span>See all cakes</span>
                <span className={arrowClassName}>{'>'}</span>
              </Link>
            </div>
          </div>

          <div className='order-1 relative mx-auto h-[405px] w-[324px] tablet:order-2 tablet:mx-0 tablet:h-[550px] tablet:w-[440px] tablet:shrink-0'>
            <Image
              src='/design/mobile-home/about-olga.png'
              alt='Olga, founder of Olgish Cakes'
              fill
              sizes='(min-width: 768px) 440px, 324px'
              className='object-cover object-[50%_50%] rounded-[16px]'
            />
            {/* Decorative top-left corner element */}
            <Image
              src='/design/top_left_corner.png'
              alt=''
              width={79}
              height={59}
              style={{ width: '79px', height: '59px' }}
              className='absolute left-[-7px] top-[-10px] z-10 pointer-events-none tablet:left-[-12px] tablet:top-[-14px]'
            />
            {/* Decorative bottom-right corner element */}
            <Image
              src='/design/bottom_right_corner.png'
              alt=''
              width={79}
              height={59}
              style={{ width: '79px', height: '59px' }}
              className='absolute right-[-9px] top-[352px] z-10 pointer-events-none tablet:bottom-[-12px] tablet:right-[-12px] tablet:top-auto'
            />
          </div>

          <div className='hidden rounded-[16px] bg-primary-50 px-6 py-7 shadow-xl tablet:order-3 tablet:flex tablet:w-[316px] tablet:h-[486px] tablet:flex-col tablet:justify-center tablet:absolute tablet:left-[729px] tablet:pl-0 tablet:pr-[26px] tablet:rounded-l-none'>
            <ul className='flex flex-col gap-4 !list-none p-0 m-0 tablet:p-0'>
              <li>
                <Link href='/cakes' className={linkClassName}>
                  <span>See all cakes</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link href='/#bestsellers' className={linkClassName}>
                  <span>View bestsellers</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link href='/market-schedule' className={linkClassName}>
                  <span>Visit our market stall</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link href='/reviews-awards' className={linkClassName}>
                  <span>Check our reviews</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link href='/celebration-cakes' className={linkClassName}>
                  <span>Browse occasion cakes</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link href='/get-custom-quote' className={linkClassName}>
                  <span>Custom cake enquiry</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href='https://www.instagram.com/olgish_cakes/'
                  className={linkClassName}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <span>Follow our Instagram</span>
                  <span className={arrowClassName}>{'>'}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
