import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute,
            retry: 1, // Retry failed requests once
        },
    },
})

export default queryClient