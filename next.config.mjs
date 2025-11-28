/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'mysql2', 
      'sequelize', 
      '@tensorflow/tfjs-node',
      '@mapbox/node-pre-gyp' 
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