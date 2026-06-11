/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't fail the production build on type/lint issues in demo pages.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    domains: ['winwin-media.s3.me-south-1.amazonaws.com', 'supabase.storage.co'],
  },
};

module.exports = nextConfig;
