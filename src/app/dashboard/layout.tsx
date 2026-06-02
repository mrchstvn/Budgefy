// src/app/dashboard/layout.tsx
// Wraps ALL pages inside /dashboard/ with the sidebar and header.
// This layout applies to: /dashboard, /dashboard/transactions,
//   /dashboard/budgets, /dashboard/debts, /dashboard/reports,
//   /dashboard/settings/app, /dashboard/settings/profile

// NO 'use client' here — this is a SERVER component.
// Server components fetch data on the server before the page renders.
// Faster than fetching in the browser (no loading spinner needed).

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardSideNav } from '@/components/layout/sidenav';
import { DashboardNavBar } from '@/components/layout/navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    // auth() is the SERVER-SIDE session check from NextAuth.
    // It reads the JWT cookie from the request headers.
    const session = await auth();



    // If not logged in, redirect to login.
    // redirect() is a Next.js function that immediately stops
    // rendering and sends the browser to the specified URL.
    if (!session?.user) redirect('/auth/login');

    return (
        // Outer container: full screen height, horizontal layout (flex row)
        <div className='min-h-screen bg-gray-50 flex'>

            {/* LEFT: Sidebar */}
            <DashboardSideNav user={session.user} />

            {/* RIGHT: Main content area */}
            {/* flex-1: take all remaining width after the sidebar */}
            {/* flex-col: stack header and content vertically */}
            <div className='flex-1 flex flex-col min-h-screen overflow-hidden'>

                {/* CONTENT: The actual page */}
                {/* overflow-y-auto: scroll this area when content is tall */}
                {/* p-6: 24px padding on all sides */}
                <main className='flex-1 overflow-y-auto p-6'>
                    <div className='max-w-6xl mx-auto animate-fade-in'>
                        {/* max-w-6xl: content won't exceed 72rem wide */}
                        {/* mx-auto: center the content horizontally */}
                        {/* animate-fade-in: our custom fade-in animation from globals.css */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

