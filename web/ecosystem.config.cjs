module.exports = {
  apps: [
    {
      name: 'litewing-web',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp/web',
      env: { NODE_ENV: 'development', PORT: 3000 },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
