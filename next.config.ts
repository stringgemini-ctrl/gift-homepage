import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage 버킷 이미지 허용
        // 형식: https://[project-id].supabase.co/storage/v1/object/public/...
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',          // 모든 경로 허용 (storage path 변동 가능)
      },
    ],
  },
};

export default nextConfig;
