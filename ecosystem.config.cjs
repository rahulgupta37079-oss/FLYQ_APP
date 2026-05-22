module.exports = {
  apps: [
    {
      name: 'flyq-expo-web',
      script: 'npx',
      args: 'expo start --web --port 19006 --host 0.0.0.0',
      env: {
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
