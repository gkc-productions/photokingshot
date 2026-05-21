#!/usr/bin/env bash
set -euo pipefail
echo "=== uptime ==="
uptime
echo
echo "=== memory ==="
free -h
echo
echo "=== top memory processes ==="
ps aux --sort=-%mem | head -15
echo
echo "=== top cpu processes ==="
ps aux --sort=-%cpu | head -15
echo
echo "=== pm2 ==="
pm2 status || true
echo
echo "=== cloudflared ==="
systemctl is-active cloudflared || true
echo
echo "=== local site ==="
curl -I http://localhost:3002 || true
