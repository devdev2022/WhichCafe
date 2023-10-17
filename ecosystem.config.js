module.exports = {
  apps: [
    {
      name: "my-express-app",
      script: "./server.js",
      instances: "2",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
