/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@lightprotocol/hasher.rs', 'privacycash'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Exclude problematic wasm imports
    config.module.rules.push({
      test: /hasher_wasm_simd_bg\.wasm$|light_wasm_hasher_bg\.wasm$/,
      type: 'asset/resource',
    })

    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    // Externalize WASM/crypto modules for server builds
    if (isServer) {
      config.externals = [...(config.externals || []), '@lightprotocol/hasher.rs', 'privacycash']
    }

    // Resolve fallback for node modules in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    return config
  },
}

export default nextConfig
