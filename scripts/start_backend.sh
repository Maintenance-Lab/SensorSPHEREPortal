#!/bin/bash
# Stops any running SensorSPHERE Portal backend, then starts a fresh one (npm run dev).

cd "$(dirname "$0")/.." || exit 1

for port in 9051 8080; do
  pids=$(netstat -ano | grep ":$port" | grep -i LISTENING | awk '{print $NF}' | sort -u)
  for pid in $pids; do
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
      echo "Backend: stopping old PID $pid (port $port)"
      taskkill //F //PID "$pid"
    fi
  done
done

echo "Starting backend (npm run dev)..."
npm run dev