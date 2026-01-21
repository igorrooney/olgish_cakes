import Image from 'next/image'

export function MobileInstagram() {
  return (
    <div className='mx-auto w-full max-w-[390px] rounded-[16px] border border-[#d6d6d6] bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative h-[30px] w-[30px]'>
            <Image
              src='/design/mobile-home/instagram-avatar.png'
              alt='Instagram avatar'
              fill
              className='rounded-full object-cover'
            />
          </div>
          <div className='flex flex-col leading-none'>
            <span className='font-sans text-[12px] text-black'>Instagram</span>
            <span className='font-sans text-[12px] text-[#848484]'>200m followers</span>
          </div>
        </div>
        <button className='rounded-full bg-[#008af5] px-3 py-1 text-[12px] font-semibold text-white'>
          View Profile
        </button>
      </div>
      <div className='relative mt-3 h-[180px] w-full overflow-hidden rounded-[12px] bg-[#c4c4c4]'>
        <Image
          src='/design/mobile-home/bestseller-secondary.png'
          alt='Instagram post preview'
          fill
          className='object-cover'
        />
      </div>
      <div className='mt-3 flex items-center gap-3'>
        <div className='relative h-6 w-6'>
          <Image src='/design/mobile-home/icon-like.png' alt='Like' fill className='object-contain' />
        </div>
        <div className='relative h-6 w-6'>
          <Image src='/design/mobile-home/icon-comment.png' alt='Comment' fill className='object-contain' />
        </div>
        <div className='relative h-6 w-6'>
          <Image src='/design/mobile-home/icon-share.png' alt='Share' fill className='object-contain' />
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <div className='relative h-6 w-6'>
            <Image src='/design/mobile-home/icon-save.png' alt='Save' fill className='object-contain' />
          </div>
          <div className='relative h-6 w-6'>
            <Image src='/design/mobile-home/icon-ig-mark.png' alt='Instagram mark' fill className='object-contain' />
          </div>
        </div>
      </div>
      <div className='mt-2 flex flex-col gap-1'>
        <p className='font-sans text-[12px] text-black'>400,123 likes</p>
        <p className='font-sans text-[12px] font-semibold text-[#008af5]'>View More on Instagram</p>
      </div>
    </div>
  )
}
