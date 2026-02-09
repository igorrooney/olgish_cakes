'use client'

import { useEffect, useRef } from 'react'
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import {
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
  const csrfQuery = useQuery<string, Error>({
    queryKey: ['csrf-token'],
    queryFn: ({ signal }) => fetchCsrfToken(signal),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

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
    return () => abortSubmit()
  }, [])

  return {
    csrfToken: csrfQuery.data,
    isCsrfLoading: csrfQuery.isLoading,
    csrfError: csrfQuery.error,
    submitMutation,
    submit,
    abortSubmit
  }
}
