#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

PORT = 8080
DIRECTORY = Path(__file__).parent / "frontend" / "public"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

os.chdir(DIRECTORY)

with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║         🚁 FLYQ Drone Controller - Web Preview              ║
╚══════════════════════════════════════════════════════════════╝

Server running on: http://localhost:{PORT}

Available pages:
  • http://localhost:{PORT}/index.html  - Project information
  • http://localhost:{PORT}/demo.html   - Interactive demo

Note: The actual app is a React Native mobile application
that requires Expo Go on a mobile device to run.

Press Ctrl+C to stop the server.
""")
    httpd.serve_forever()
