import React from 'react';

interface StructuredDataProps {
    data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Website Schema
export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Collection Management Platform',
    description: 'Modern enterprise-grade collection management platform with advanced filtering and drag-and-drop functionality',
    url: 'https://your-domain.com',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://your-domain.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
    },
};

// Organization Schema
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Collection Management Platform',
    url: 'https://your-domain.com',
    logo: 'https://your-domain.com/logo.png',
    description: 'Enterprise-grade collection management solution',
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@your-domain.com',
    },
    sameAs: [
        'https://twitter.com/yourhandle',
        'https://linkedin.com/company/yourcompany',
        'https://github.com/umtcn/collection-management-platform',
    ],
};

// Software Application Schema
export const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Collection Management Platform',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
    },
    description: 'Modern collection management platform built with Next.js featuring product management, drag-and-drop functionality, and comprehensive filtering capabilities.',
    featureList: [
        'Authentication System',
        'Collection Management',
        'Product Pinning with Drag & Drop',
        'Advanced Filtering',
        'Dark Mode Support',
        'Responsive Design',
        'Real-time Updates',
    ],
};

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
