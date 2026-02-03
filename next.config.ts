import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Vypnutí optimalizace obrázků
  images: {
    unoptimized: true,
  },

  // 2. Ignorování chyb při buildu
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Povolení statického servírování
  output: 'standalone',

  // 4. Přidání hlaviček pro správné zobrazování obrázků
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;