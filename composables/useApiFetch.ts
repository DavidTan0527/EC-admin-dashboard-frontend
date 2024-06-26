import type { UseFetchOptions } from 'nuxt/app'

export const useApiFetch: typeof useFetch = (request, opts?) => {
  const config = useRuntimeConfig()

  let options : UseFetchOptions = {
    baseURL: config.public.apiBase,
    ...opts,
  }

  return useFetch(request, options)
}

