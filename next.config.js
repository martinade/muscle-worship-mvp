/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['images.unsplash.com'],
    },
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;
