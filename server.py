#!/usr/bin/env python3
"""
server.py - Lightweight local web server for Klondike Solitaire.
Allows playing on your desktop browser and iPhone over local Wi-Fi or Tailscale.
"""

import http.server
import json
import os
import socket
import sys
import webbrowser
from pathlib import Path

DEFAULT_PORT = 8080
DIRECTORY = Path(__file__).parent.resolve()


def get_local_ip():
    """Detect the local Wi-Fi / LAN IP address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't need to actually be reachable
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


def get_tailscale_ip():
    """Detect Tailscale IP if available."""
    try:
        import subprocess
        output = subprocess.check_output(['ip', '-4', 'addr', 'show', 'tailscale0'], stderr=subprocess.DEVNULL).decode()
        for line in output.splitlines():
            line = line.strip()
            if line.startswith('inet '):
                return line.split()[1].split('/')[0]
    except Exception:
        pass
    return None


class SolitaireHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def do_GET(self):
        if self.path == '/api/network-info':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            info = {
                'ip': get_local_ip(),
                'tailscale': get_tailscale_ip(),
                'port': self.server.server_port
            }
            self.wfile.write(json.dumps(info).encode('utf-8'))
            return

        super().do_GET()

    def log_message(self, format, *args):
        # Suppress verbose asset logging, keep terminal clean
        if self.path.startswith('/api/'):
            return
        # Only log actual page requests
        if args and str(args[0]).startswith(('GET / ', 'GET /index.html')):
            sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")


def run_server(port=DEFAULT_PORT, auto_open=False):
    os.chdir(DIRECTORY)

    # Find free port if requested port is taken
    chosen_port = port
    server = None
    for p in range(port, port + 10):
        try:
            server = http.server.ThreadingHTTPServer(('0.0.0.0', p), SolitaireHandler)
            chosen_port = p
            break
        except OSError:
            continue

    if not server:
        print(f"Error: Could not bind to port in range {port}-{port+10}")
        sys.exit(1)

    local_ip = get_local_ip()
    tailscale_ip = get_tailscale_ip()

    print("\n" + "=" * 62)
    print("           ♠ ♥ ♦ ♣  KLONDIKE SOLITAIRE  ♣ ♦ ♥ ♠")
    print("=" * 62)
    print("\n  Game server is RUNNING!")
    print(f"\n  🖥️   Desktop PC:   http://localhost:{chosen_port}")
    print(f"  📱  iPhone (Wi-Fi): http://{local_ip}:{chosen_port}")
    if tailscale_ip:
        print(f"  🌐  Tailscale:    http://{tailscale_ip}:{chosen_port}")
    print("\n  How to play on iPhone:")
    print("  1. Connect your iPhone to the same Wi-Fi network.")
    print(f"  2. Open Safari and go to: http://{local_ip}:{chosen_port}")
    print("  3. (Optional) In Safari, tap Share -> 'Add to Home Screen'")
    print("     to install Solitaire as a full-screen offline app!")
    print("\n" + "-" * 62)
    print("  Tip: On desktop, click '📱 Play on iPhone' in the game header")
    print("       to display a scannable QR Code on your screen!")
    print("-" * 62 + "\n")
    print("  Press Ctrl+C to stop the server.\n")

    if auto_open:
        webbrowser.open(f"http://localhost:{chosen_port}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Solitaire server. Goodbye!\n")
        server.server_close()


if __name__ == '__main__':
    auto_open = '--open' in sys.argv
    port = DEFAULT_PORT
    for arg in sys.argv[1:]:
        if arg.isdigit():
            port = int(arg)
    run_server(port, auto_open=auto_open)
