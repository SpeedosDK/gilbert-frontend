/** @type {import('next').NextConfig} */
// Fallback peger på den rigtige backend (IKKE localhost), så proxyen virker
// på Railway selv hvis env-variablen ikke når frem til runtime.
const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://gilbert-production.up.railway.app';

// Diagnostik: udskriv hvilken backend proxyen peger på ved opstart (se Railway-log).
console.log(`[next.config] Proxy /api/* -> ${BACKEND_URL}/api/*`);

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