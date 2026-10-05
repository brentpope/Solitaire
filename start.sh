#!/usr/bin/env bash
# Quick launcher for Klondike Solitaire
cd "$(dirname "$0")"
chmod +x server.py
python3 server.py "$@"
