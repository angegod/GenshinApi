const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/GenshinApi' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: basePath,
  basePath: basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath, // <== 這樣才會正確注入
  },
};

export default nextConfig;