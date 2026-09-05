module.exports = {
  apps: [
    {
      name: 'drive-me-api',
      cwd: '../backend',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      time: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
    },
  ],
};
