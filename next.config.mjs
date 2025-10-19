/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Output for Docker
    output: 'standalone',

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.secilstore.com',
                pathname: '/docs/images/**',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Performance optimizations
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },

    // Compression
    compress: true,

    // Trailing slash behavior (better for SEO consistency)
    trailingSlash: false,

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ]
    },

    // Redirects for SEO (example: www to non-www, old URLs to new)
    async redirects() {
        return [
            // Example: Redirect old paths to new paths
            // {
            //     source: '/old-path',
            //     destination: '/new-path',
            //     permanent: true,
            // },
        ];
    },
}

export default nextConfig
