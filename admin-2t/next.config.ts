import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  
  // Configurar rewrites para proxy del backend
  // Esto permite que todas las peticiones a /api/* vayan al backend
  // sin problemas de CORS ni cookies cross-domain
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    console.log('[Next.js] Backend URL configurada:', backendUrl);
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

