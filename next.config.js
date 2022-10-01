/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "redditclone2481068871f7744358706595ed8df9f98180626-dev.s3.us-east-1.amazonaws.com",
      "source.unsplash.com",
    ],
  },
};

module.exports = nextConfig;
