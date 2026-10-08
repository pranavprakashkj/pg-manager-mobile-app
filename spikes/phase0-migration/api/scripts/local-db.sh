#!/usr/bin/env bash
# Throwaway Postgres cluster for the spike, inside this folder, on port 55432.
# Uses Postgres.app binaries if present; never touches any other database.
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN="${PGBIN:-/Applications/Postgres.app/Contents/Versions/latest/bin}"
DATA=".local-pg"
PORT=55432

case "${1:-}" in
  init)
    rm -rf "$DATA"
    "$PGBIN/initdb" -D "$DATA" -U spike --auth=trust >/dev/null
    "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/server.log" start >/dev/null
    "$PGBIN/createdb" -h 127.0.0.1 -p $PORT -U spike pgm_spike
    echo "postgres://spike@127.0.0.1:$PORT/pgm_spike"
    ;;
  start) "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/server.log" start ;;
  stop) "$PGBIN/pg_ctl" -D "$DATA" stop ;;
  *) echo "usage: local-db.sh init|start|stop"; exit 1 ;;
esac
