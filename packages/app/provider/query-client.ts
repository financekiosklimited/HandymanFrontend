import { QueryClient, keepPreviousData } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes - garbage collection time
      retry: 1,
      refetchOnWindowFocus: false, // Mobile apps don't need window focus refetching
      refetchOnReconnect: 'always', // Refetch when network comes back
      networkMode: 'offlineFirst', // Serve cached data when offline
      placeholderData: keepPreviousData, // Smooth loading - show old data while fetching new
    },
  },
})
