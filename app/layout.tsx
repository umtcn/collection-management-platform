import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { StructuredData, websiteSchema, organizationSchema, softwareSchema } from '@/components/seo/StructuredData';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'),
    title: {
        default: 'Collection Management Platform | Manage Your Products',
        template: '%s | Collection Management Platform',
    },
    description: 'A modern, enterprise-grade collection management platform built with Next.js. Manage product collections efficiently with advanced filtering, drag-and-drop functionality, and real-time updates.',
    keywords: [
        'collection management',
        'product management',
        'e-commerce',
        'inventory management',
        'product collections',
        'drag and drop',
        'filtering',
        'Next.js',
        'React',
        'TypeScript',
        'enterprise software',
        'business tools',
    ],
    authors: [
        { 
            name: 'Collection Management Team',
            url: 'https://your-domain.com',
        }
    ],
    creator: 'Collection Management Platform',
    publisher: 'Collection Management Platform',
    applicationName: 'Collection Management Platform',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://your-domain.com',
        title: 'Collection Management Platform | Manage Your Products Efficiently',
        description: 'Modern enterprise-grade collection management platform with advanced filtering, drag-and-drop, and real-time updates.',
        siteName: 'Collection Management Platform',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Collection Management Platform',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Collection Management Platform | Manage Your Products',
        description: 'Modern enterprise-grade collection management platform with advanced filtering and drag-and-drop functionality.',
        images: ['/twitter-image.png'],
        creator: '@yourhandle',
        site: '@yourhandle',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
            { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        other: [
            {
                rel: 'mask-icon',
                url: '/safari-pinned-tab.svg',
                color: '#3b82f6',
            },
        ],
    },
    manifest: '/manifest.json',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
    ],
    category: 'technology',
    alternates: {
        canonical: '/',
    },
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
                <StructuredData data={websiteSchema} />
                <StructuredData data={organizationSchema} />
                <StructuredData data={softwareSchema} />
            </head>
            <body className={cn(inter.variable, 'min-h-screen antialiased')}>
                {children}
            </body>
        </html>
    );
}
