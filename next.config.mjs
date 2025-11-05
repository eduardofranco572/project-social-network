/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'sequelize'],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = [
        'mysql2',
        'sqlite3',
        'tedious',
        'pg',
        'pg-hstore',
        'mariadb'
      ];

      config.externals.push(...externals);
    }

    return config;
  },
};

export default nextConfig;