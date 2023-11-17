
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    experimental: {
        forceSwcTransforms: true
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://mikhailcoapi.herokuapp.com/:path*', // Proxy to Backend,
        }
      ]
    }
  }
  
  module.exports = nextConfig
  