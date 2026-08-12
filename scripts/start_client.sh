#!/bin/bash
# Stops any running SensorSPHERE Portal client, then starts a fresh one (npm start on port 3001).

cd "$(dirname "$0")/.." || exit 1
cd client || exit 1

port=3001
pids=$(netstat -ano | grep ":$port" | grep -i LISTENING | awk '{print $NF}' | sort -u)
for pid in $pids; do
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    echo "Client: stopping old PID $pid (port $port)"
    taskkill //F //PID "$pid"
  fi
done

echo "Starting client on port 3001..."
PORT=3001 DANGEROUSLY_DISABLE_HOST_CHECK=true npm start