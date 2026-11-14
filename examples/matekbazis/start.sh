#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server 8765 >/dev/null 2>&1 &
sleep 1
xdg-open "http://127.0.0.1:8765/" 2>/dev/null || echo "Nyisd meg: http://127.0.0.1:8765/"
