#!/bin/sh
cd "$(dirname "$0")"
echo 'Open http://localhost:8040'
python3 -m http.server 8040
