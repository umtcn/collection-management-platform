import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Collections',
    description: 'Browse and manage your product collections. View, edit, and organize collections with advanced filtering and sorting capabilities.',
    keywords: [
        'collections',
        'product collections',
        'collection management',
        'e-commerce collections',
        'product catalog',
    ],
    openGraph: {
        title: 'Collections | Collection Management Platform',
        description: 'Browse and manage your product collections efficiently',
        url: '/collections',
        type: 'website',
    },
    twitter: {
        title: 'Collections | Collection Management Platform',
        description: 'Browse and manage your product collections efficiently',
    },
    alternates: {
        canonical: '/collections',
    },
};

export default function CollectionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
