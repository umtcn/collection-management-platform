import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    title: 'Collection Management Platform',
    description: 'Manage your product collections efficiently',
    keywords: ['collection', 'management', 'products', 'e-commerce'],
    authors: [{ name: 'Your Company' }],
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={cn(inter.variable, 'min-h-screen antialiased')}>
                {children}
            </body>
        </html>
    );
}
