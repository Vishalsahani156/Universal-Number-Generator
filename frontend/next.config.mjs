/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "helper-provable-sandy.ngrok-free.dev",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
  // Proxy API through Next.js so one ngrok URL works on mobile (browser never hits localhost:8000)
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
