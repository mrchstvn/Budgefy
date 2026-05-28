// src/lib/providers.tsx
// Wraps the app with React Query's provider.
// This makes useQuery() and useMutation() available
// to every component in the app.

'use client';
// 'use client' is required because this component uses:
// - useState (to create the QueryClient)
// - ReactNode (renders children, which are interactive)
// Client components render in the BROWSER, not the server.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
    // ReactNode = anything React can render: JSX, strings, arrays, null.
    // 'children' is whatever is placed INSIDE <Providers>...</Providers>.
}

export function Providers({ children }: ProvidersProps) {
    // useState with a function: the function only runs ONCE on first render.
    // Without this, new QueryClient() would run on EVERY render,
    // destroying the cache each time.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // staleTime: how long data is considered 'fresh'.
                        // During this time, React Query won't refetch even
                        // if the component re-mounts or the window refocuses.
                        // 5 * 60 * 1000 = 5 minutes in milliseconds.
                        staleTime: 5 * 60 * 1000,

                        // gcTime: how long to keep UNUSED data in cache.
                        // 10 minutes after a component unmounts, its cached
                        // data is garbage collected.
                        gcTime: 10 * 60 * 1000,

                        // Don't refetch when switching browser tabs.
                        // Financial data doesn't change every second.
                        refetchOnWindowFocus: false,

                        // Retry failed requests twice before showing an error.
                        retry: 2,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools panel — only visible in development, hidden in production */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

