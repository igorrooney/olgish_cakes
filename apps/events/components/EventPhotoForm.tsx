'use client'

import { ImagePlus, Loader2, MessageCircle, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  DEFAULT_MAX_IMAGES,
  FALLBACK_ERROR_MESSAGE
} from '@/lib/constants'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  buildSuccessPath,
  parseSuccessRequestId
} from '@/lib/success'
import {
  ACCEPTED_IMAGE_TYPES,
  normaliseImageMimeType,
  validateClientFile,
  validateImageCount
} from '@/lib/validation'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface SettingsResponse {
  eventName: string
  maxImages: number
}

interface CsrfResponse {
  csrfToken: string
}

interface SignedUploadResponse {
  bucket: string
  uploads: SignedUploadItem[]
}

interface EventPhotoRequestResponse {
  id: string
}

interface SignedUploadItem {
  fileName: string
  mimeType: string
  size: number
  path: string
  token: string
  proof: string
}

interface PreparedFile {
  file: File
  mimeType: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json() as unknown
  } catch {
    return null
  }
}

function getApiError(value: unknown): string | null {
  const record = asRecord(value)
  const error = record?.error

  return typeof error === 'string' && error.length > 0 ? error : null
}

function isSettingsResponse(value: unknown): value is SettingsResponse {
  const record = asRecord(value)
  return (
    typeof record?.eventName === 'string' &&
    typeof record.maxImages === 'number'
  )
}

function isCsrfResponse(value: unknown): value is CsrfResponse {
  const record = asRecord(value)
  return typeof record?.csrfToken === 'string'
}

function isSignedUploadResponse(value: unknown): value is SignedUploadResponse {
  const record = asRecord(value)
  const uploads = record?.uploads

  return (
    typeof record?.bucket === 'string' &&
    Array.isArray(uploads) &&
    uploads.every((item) => {
      const upload = asRecord(item)

      return (
        typeof upload?.fileName === 'string' &&
        typeof upload.mimeType === 'string' &&
        typeof upload.size === 'number' &&
        typeof upload.path === 'string' &&
        typeof upload.token === 'string' &&
        typeof upload.proof === 'string'
      )
    })
  )
}

function isEventPhotoRequestResponse(value: unknown): value is EventPhotoRequestResponse {
  const record = asRecord(value)
  const id = record?.id

  return typeof id === 'string' && parseSuccessRequestId(id) !== null
}

function prepareFiles(files: File[]): PreparedFile[] | null {
  const prepared: PreparedFile[] = []

  for (const file of files) {
    const error = validateClientFile(file)

    if (error) {
      return null
    }

    const mimeType = normaliseImageMimeType(file.name, file.type)

    if (!mimeType) {
      return null
    }

    prepared.push({ file, mimeType })
  }

  return prepared
}

export function EventPhotoForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<SettingsResponse>({
    eventName: 'Olgish Cakes event',
    maxImages: DEFAULT_MAX_IMAGES
  })
  const [csrfToken, setCsrfToken] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const whatsappUrl = useMemo(() => buildWhatsAppUrl(fullName), [fullName])

  useEffect(() => {
    const controller = new AbortController()

    async function loadFormData() {
      try {
        const [settingsResponse, csrfResponse] = await Promise.all([
          fetch('/api/event-photo/settings', {
            credentials: 'same-origin',
            signal: controller.signal
          }),
          fetch('/api/csrf-token', {
            credentials: 'same-origin',
            signal: controller.signal
          })
        ])

        const settingsBody = await readJson(settingsResponse)
        const csrfBody = await readJson(csrfResponse)

        if (!settingsResponse.ok || !isSettingsResponse(settingsBody)) {
          throw new Error(getApiError(settingsBody) ?? FALLBACK_ERROR_MESSAGE)
        }

        if (!csrfResponse.ok || !isCsrfResponse(csrfBody)) {
          throw new Error(getApiError(csrfBody) ?? FALLBACK_ERROR_MESSAGE)
        }

        setSettings(settingsBody)
        setCsrfToken(csrfBody.csrfToken)
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : FALLBACK_ERROR_MESSAGE)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadFormData()

    return () => controller.abort()
  }, [])

  function handleFileChange() {
    const files = Array.from(fileInputRef.current?.files ?? [])
    setSelectedFiles(files)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const files = Array.from(fileInputRef.current?.files ?? [])
    const countError = validateImageCount(files.length, settings.maxImages)

    if (countError) {
      setError(countError)
      return
    }

    const preparedFiles = prepareFiles(files)

    if (!preparedFiles) {
      setError('Please upload a JPEG, PNG, WebP or HEIC image up to 20 MB.')
      return
    }

    if (!csrfToken) {
      setError('This form is still loading. Please try again in a moment.')
      return
    }

    const controller = new AbortController()
    setIsSubmitting(true)

    try {
      const uploadResponse = await fetch('/api/event-photo/uploads', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          csrfToken,
          files: preparedFiles.map((item) => ({
            name: item.file.name,
            type: item.mimeType,
            size: item.file.size
          }))
        }),
        signal: controller.signal
      })
      const uploadBody = await readJson(uploadResponse)

      if (!uploadResponse.ok || !isSignedUploadResponse(uploadBody)) {
        throw new Error(getApiError(uploadBody) ?? FALLBACK_ERROR_MESSAGE)
      }

      const supabase = createSupabaseBrowserClient()

      for (let index = 0; index < preparedFiles.length; index += 1) {
        const prepared = preparedFiles[index]
        const upload = uploadBody.uploads[index]

        if (!prepared || !upload) {
          throw new Error(FALLBACK_ERROR_MESSAGE)
        }

        const { error: uploadError } = await supabase.storage
          .from(uploadBody.bucket)
          .uploadToSignedUrl(upload.path, upload.token, prepared.file, {
            contentType: prepared.mimeType,
            upsert: false
          })

        if (uploadError) {
          throw new Error('Your image could not be uploaded. Please try again.')
        }
      }

      const requestResponse = await fetch('/api/event-photo/request', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          csrfToken,
          fullName,
          email,
          files: uploadBody.uploads.map((upload) => ({
            fileName: upload.fileName,
            mimeType: upload.mimeType,
            size: upload.size,
            path: upload.path,
            proof: upload.proof
          }))
        }),
        signal: controller.signal
      })
      const requestBody = await readJson(requestResponse)

      if (!requestResponse.ok || !isEventPhotoRequestResponse(requestBody)) {
        throw new Error(getApiError(requestBody) ?? FALLBACK_ERROR_MESSAGE)
      }

      router.push(buildSuccessPath(requestBody.id))
    } catch (submitError) {
      if (!controller.signal.aborted) {
        setError(submitError instanceof Error ? submitError.message : FALLBACK_ERROR_MESSAGE)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <section className="rounded-lg border border-base-300 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">
          {settings.eventName}
        </p>
        <h2 className="mt-1 text-2xl font-bold leading-tight">Send your image</h2>
      </div>

      {error ? (
        <div className="alert alert-error mb-5 items-start text-sm">
          <div>
            <p>{error}</p>
            <a className="btn btn-sm btn-outline mt-3 gap-2" href={whatsappUrl}>
              <MessageCircle aria-hidden="true" size={16} />
              Send on WhatsApp
            </a>
          </div>
        </div>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="form-control w-full">
          <span className="label pb-1">
            <span className="label-text font-semibold">Name</span>
          </span>
          <input
            className="input input-bordered w-full bg-white"
            name="fullName"
            value={fullName}
            minLength={2}
            maxLength={120}
            autoComplete="name"
            required
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>

        <label className="form-control w-full">
          <span className="label pb-1">
            <span className="label-text font-semibold">Email</span>
          </span>
          <input
            className="input input-bordered w-full bg-white"
            name="email"
            type="email"
            value={email}
            maxLength={254}
            autoComplete="email"
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <div>
          <label
            className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/40 bg-base-100 px-4 py-8 text-center transition hover:border-primary"
            htmlFor="event-photo-upload"
          >
            <ImagePlus aria-hidden="true" className="mb-3 text-primary" size={34} />
            <span className="font-semibold">Upload image</span>
            <span className="mt-1 text-sm text-base-content/70">
              JPEG, PNG, WebP or HEIC. Max 20 MB.
            </span>
          </label>
          <input
            ref={fileInputRef}
            id="event-photo-upload"
            className="sr-only"
            name="images"
            type="file"
            accept={`${ACCEPTED_IMAGE_TYPES.join(',')},.heic`}
            multiple={settings.maxImages > 1}
            required
            onChange={handleFileChange}
          />
          {selectedFiles.length > 0 ? (
            <ul className="mt-3 grid gap-2 text-sm">
              {selectedFiles.map((file) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between rounded-md border border-base-300 bg-base-100 px-3 py-2"
                >
                  <span className="truncate pr-3">{file.name}</span>
                  <span className="shrink-0 text-base-content/60">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          className="btn btn-primary min-h-12 gap-2"
          type="submit"
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <Send aria-hidden="true" size={18} />
          )}
          {isSubmitting ? 'Sending' : 'Send image'}
        </button>
      </form>
    </section>
  )
}
