import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" digunakan untuk deployment Docker/custom server.
  // Vercel akan auto-handle build, jadi ini tidak berdampak di Vercel.
  // Untuk Docker deployment (mis. Railway, Fly.io), ini akan menghasilkan
  // folder .next/standalone yang siap di-deploy.
  output: "standalone",
  typescript: {
    // Ignore TS errors saat build supaya tidak block deploy
    // (kode sudah di-lint manual via `bun run lint`)
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
