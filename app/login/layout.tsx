import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to access your collection management dashboard. Secure authentication with NextAuth.js.',
    openGraph: {
        title: 'Login | Collection Management Platform',
        description: 'Sign in to manage your product collections',
        url: '/login',
    },
    twitter: {
        title: 'Login | Collection Management Platform',
        description: 'Sign in to manage your product collections',
    },
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: '/login',
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
