// @ts-nocheck
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
}

let config = nextConfig

// Prefer to wrap with Cloudflare adapter when available, but fail gracefully
try {
  // @cloudflare/next-on-pages exports a function; require it only if installed
  // This keeps local dev builds working before the adapter is installed.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withCloudflareFactory = require('@cloudflare/next-on-pages')
  if (typeof withCloudflareFactory === 'function') {
    const withCloudflare = withCloudflareFactory()
    config = withCloudflare(nextConfig)
  }
} catch (e) {
  // Adapter not installed — continue with default config
}

module.exports = withPWA(config)
