'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  csrfTokenQueryKey,
  csrfTokenStaleTimeMs,
  fetchCsrfToken,
  submitContactPageEnquiry,
  type SubmissionError
} from './contactPageEnquiry'

type UseContactPageEnquiryOptions = UseMutationOptions<
  Record<string, unknown>,
  SubmissionError,
  { submissionData: FormData, signal?: AbortSignal }
>

export const useContactPageEnquiry = (options?: UseContactPageEnquiryOptions) => {
  const queryClient = useQueryClient()
  const [isRefreshingCsrf, setIsRefreshingCsrf] = useState(false)
  const csrfQuery = useQuery<string, Error>({
    queryKey: csrfTokenQueryKey,
    queryFn: ({ signal }) => fetchCsrfToken(signal),
    staleTime: csrfTokenStaleTimeMs,
    refetchOnWindowFocus: false
  })

  const submitMutation = useMutation<
    Record<string, unknown>,
    SubmissionError,
    { submissionData: FormData, signal?: AbortSignal }
  >({
    mutationFn: ({ submissionData, signal }) =>
      submitContactPageEnquiry(submissionData, signal),
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
    return () => abortSubmit()
  }, [])

  const refreshCsrfToken = async () => {
    setIsRefreshingCsrf(true)

    try {
      return await queryClient.fetchQuery({
        queryKey: csrfTokenQueryKey,
        queryFn: ({ signal }) => fetchCsrfToken(signal),
        staleTime: 0
      })
    } finally {
      setIsRefreshingCsrf(false)
    }
  }

  return {
    csrfToken: csrfQuery.data,
    isCsrfLoading: csrfQuery.isLoading || isRefreshingCsrf,
    isRefreshingCsrf,
    csrfError: csrfQuery.error,
    refreshCsrfToken,
    submitMutation,
    submit,
    abortSubmit
  }
}
