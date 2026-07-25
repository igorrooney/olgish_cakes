import { NextRequest, NextResponse } from 'next/server'
import {
  getTestimonialsPage,
  InvalidTestimonialsCursorError,
  maxTestimonialsCursorLength
} from '@/app/utils/fetchTestimonials'

export async function GET(request: NextRequest) {
  const cursorParam = request.nextUrl.searchParams.get('cursor')

  if (
    request.nextUrl.searchParams.has('cursor') &&
    (cursorParam === null ||
      cursorParam.length === 0 ||
      cursorParam.length > maxTestimonialsCursorLength)
  ) {
    return NextResponse.json(
      { error: 'Invalid testimonials cursor' },
      { status: 400 }
    )
  }

  try {
    const page = await getTestimonialsPage(cursorParam)

    return NextResponse.json(page, { status: 200 })
  } catch (error) {
    if (error instanceof InvalidTestimonialsCursorError) {
      return NextResponse.json(
        { error: 'Invalid testimonials cursor' },
        { status: 400 }
      )
    }

    console.error('Failed to retrieve testimonials:', error)

    return NextResponse.json(
      { error: 'Unable to retrieve testimonials' },
      { status: 500 }
    )
  }
}
