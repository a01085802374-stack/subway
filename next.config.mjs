/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 빌드 시 TypeScript 오류 무시 (개발 중에만 사용)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 빌드 시 ESLint 오류 무시 (개발 중에만 사용)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
