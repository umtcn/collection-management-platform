import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Collection',
    description: 'Edit and manage your collection. Pin products, apply filters, and organize your collection with drag-and-drop functionality.',
    openGraph: {
        title: 'Edit Collection | Collection Management Platform',
        description: 'Edit and organize your product collection',
        url: '/edit',
    },
    robots: {
        index: false, // Don't index dynamic edit pages
        follow: true,
    },
};

export default function EditLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
