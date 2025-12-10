const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath;
  
  // Route handling
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'frontend', 'public', 'index.html');
  } else if (req.url === '/demo' || req.url === '/demo.html') {
    filePath = path.join(__dirname, 'frontend', 'public', 'demo.html');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  
  // Serve the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading page');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         🚁 FLYQ Drone Controller - Web Preview              ║
╚══════════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}

Available pages:
  • http://localhost:${PORT}/          - Project information
  • http://localhost:${PORT}/demo      - Interactive demo

Note: The actual app is a React Native mobile application
that requires Expo Go on a mobile device to run.

Press Ctrl+C to stop the server.
  `);
});
