/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");
require("dotenv").config();

const nextConfig = {
  i18n,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
