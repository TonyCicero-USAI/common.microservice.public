const { appName } = require('./app/app').default;

module.exports = {
  apps : [{
    name: appName,
    script: './src/index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instance_var: 'INSTANCE_ID', // To prevent problems w/ node-config using same NODE_APP_INSTANCE name
    instances: 1,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    env_dev: {
      NODE_ENV: 'dev'
    },
    env_test: {
      NODE_ENV: 'test'
    },
    env_staging: {
      NODE_ENV: 'staging'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
