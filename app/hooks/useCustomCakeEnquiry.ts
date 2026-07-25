'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from '@tanstack/react-query'
import {
  csrfTokenQueryKey,
  fetchCsrfToken,
  submitCustomCakeEnquiry,
  type SubmissionError
} from '@/app/services/customCakeEnquiry'

type UseCustomCakeEnquiryOptions = UseMutationOptions<
  Record<string, unknown>,
  SubmissionError,
  { submissionData: FormData; signal?: AbortSignal }
>

export const useCustomCakeEnquiry = (options?: UseCustomCakeEnquiryOptions) => {
  const queryClient = useQueryClient()
  const [isRefreshingCsrf, setIsRefreshingCsrf] = useState(false)
  const csrfRequestCounterRef = useRef(0)
  const activeCsrfQueryKeyRef = useRef<QueryKey | null>(null)

  const submitMutation = useMutation<
    Record<string, unknown>,
    SubmissionError,
    { submissionData: FormData; signal?: AbortSignal }
  >({
    mutationFn: ({ submissionData, signal }) =>
      submitCustomCakeEnquiry(submissionData, signal),
    ...options
  })

  const abortRef = useRef<AbortController | null>(null)

  const submit = (submissionData: FormData) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    submitMutation.mutate({ submissionData, signal: controller.signal })
  }

  const abortSubmit = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }

  useEffect(() => {
    return () => {
      abortSubmit()

      if (activeCsrfQueryKeyRef.current) {
        void queryClient.cancelQueries({
          queryKey: activeCsrfQueryKeyRef.current,
          exact: true
        })
      }
    }
  }, [queryClient])

  const refreshCsrfToken = async () => {
    csrfRequestCounterRef.current += 1
    const queryKey = [
      ...csrfTokenQueryKey,
      'submission',
      csrfRequestCounterRef.current
    ] as const

    activeCsrfQueryKeyRef.current = queryKey
    setIsRefreshingCsrf(true)

    try {
      return await queryClient.fetchQuery({
        queryKey,
        queryFn: ({ signal }) => fetchCsrfToken(signal),
        staleTime: 0,
        gcTime: 0
      })
    } finally {
      if (activeCsrfQueryKeyRef.current === queryKey) {
        activeCsrfQueryKeyRef.current = null
      }

      setIsRefreshingCsrf(false)
    }
  }

  return {
    isCsrfLoading: isRefreshingCsrf,
    isRefreshingCsrf,
    refreshCsrfToken,
    submitMutation,
    submit,
    abortSubmit
  }
}
