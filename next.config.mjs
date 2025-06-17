/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'localhost',
      'your-backend-app.onrender.com', // Domaine Render.com
      'render.com',
      '*.onrender.com'
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" 
              ? "https://your-frontend-app.onrender.com" 
              : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
      // Headers spécifiques pour les requêtes vers Render.com
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
  // Configuration pour les rewrites vers le backend cloud
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/graphql/:path*",
          destination: "https://your-backend-app.onrender.com/graphql/:path*",
        },
        {
          source: "/api/:path*", 
          destination: "https://your-backend-app.onrender.com/api/:path*",
        },
      ];
    }
    return [];
  },
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
