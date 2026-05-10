import { NextResponse } from 'next/server'

const supportedFormContentTypes = [
  'multipart/form-data',
  'application/x-www-form-urlencoded'
]

type ReadFormDataResult =
  | {
      ok: true
      formData: FormData
    }
  | {
      ok: false
      response: NextResponse
    }

export function isSupportedFormContentType(request: Request) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''

  return supportedFormContentTypes.some((supportedContentType) => {
    return contentType.startsWith(supportedContentType)
  })
}

export function createUnsupportedFormContentTypeResponse() {
  return NextResponse.json(
    { error: 'Unsupported content type. Submit this form using multipart/form-data.' },
    { status: 415 }
  )
}

export async function readRequiredFormData(request: Request): Promise<ReadFormDataResult> {
  if (!isSupportedFormContentType(request)) {
    return {
      ok: false,
      response: createUnsupportedFormContentTypeResponse()
    }
  }

  try {
    return {
      ok: true,
      formData: await request.formData()
    }
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid form submission' },
        { status: 400 }
      )
    }
  }
}
