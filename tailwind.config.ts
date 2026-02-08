import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 지브리 스타일 색상 팔레트
        ghibli: {
          // 크림/베이지 배경색
          cream: '#FDF8F0',
          beige: '#F5ECD7',
          sand: '#E8DCC4',
          // 자연의 녹색
          forest: '#5B8C5A',
          leaf: '#7BA876',
          moss: '#9CB88D',
          mint: '#B8D4A8',
          // 하늘/물 계열
          sky: '#87CEEB',
          cloud: '#B5D8E8',
          water: '#6BB3D9',
          // 따뜻한 계열
          terracotta: '#E07A5F',
          coral: '#F4A582',
          sunset: '#F8B595',
          // 갈색/흙 계열
          earth: '#8B7355',
          wood: '#A68B5B',
          bark: '#6B5344',
          // 텍스트
          charcoal: '#4A4035',
          brown: '#5C524C',
        },
      },
      fontFamily: {
        ghibli: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'ghibli': '1rem',
      },
      boxShadow: {
        'ghibli': '0 4px 20px -2px rgba(139, 115, 85, 0.15)',
        'ghibli-lg': '0 8px 30px -4px rgba(139, 115, 85, 0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
