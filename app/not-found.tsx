import Link from 'next/link'

export default function NotFound() {
  return (
    <section className='bg-base-100 px-4 py-16 tablet:px-10 tablet:py-24'>
      <div className='mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center text-center'>
        <p className='font-body text-sm font-semibold uppercase tracking-[0.22em] text-primary-600'>
          404
        </p>
        <h1 className='mt-4 font-oldenburg text-[2.5rem] leading-none tracking-[0.04em] text-primary-800 tablet:text-[4rem]'>
          Page not found
        </h1>
        <p className='mt-4 max-w-xl text-base leading-7 text-base-content/78 tablet:text-lg tablet:leading-8'>
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href='/'
          className='btn btn-primary mt-8 rounded-full border-none px-6 normal-case shadow-none'
        >
          Return home
        </Link>
      </div>
    </section>
  )
}
