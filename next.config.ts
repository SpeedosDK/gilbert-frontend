/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Extract hostname safely for remotePatterns
let backendHostname = 'localhost';
try {
    backendHostname = new URL(BACKEND_URL).hostname;
} catch {
    backendHostname = 'localhost';
}

const nextConfig = {
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/api/images/**',
            },
            ...(backendHostname !== 'localhost' ? [{
                protocol: 'https' as const,
                hostname: backendHostname,
                pathname: '/api/images/**',
            }] : []),
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${BACKEND_URL}/api/:path*`,
            },
        ]
    },
}

export default nextConfig