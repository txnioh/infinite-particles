/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      config.externals.push({
        'three/examples/jsm/controls/OrbitControls': 'OrbitControls',
      })
      return config
    },
  }
  
  export default nextConfig