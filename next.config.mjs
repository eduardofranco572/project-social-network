/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', 
      },
    ],
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      'mysql2', 
      'sequelize', 
      '@tensorflow/tfjs-node',
      '@mapbox/node-pre-gyp',
      'amqplib'
    ],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = [
        'mysql2',
        'sqlite3',
        'tedious',
        'pg',
        'pg-hstore',
        'mariadb',
        '@tensorflow/tfjs-node',
        '@mapbox/node-pre-gyp', 
        'encoding' 
      ];

      config.externals.push(...externals);
    }

    config.module.rules.push({
      test: /\.html$/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;