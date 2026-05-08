#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
cd /Users/kalena/dev/TNTTours
exec /usr/local/bin/node node_modules/next/dist/bin/next dev --webpack
