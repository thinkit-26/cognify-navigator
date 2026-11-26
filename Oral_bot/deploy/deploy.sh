#!/usr/bin/env bash
# Deploys the Viva backend on the server: pull, install requirements, restart, check it came up, and
# roll back to the previous commit if it did not. GitHub Actions runs this over SSH after a merge to main
# (.github/workflows/deploy-backend.yml); it can also be run by hand on the server.
#
# The whole script is one brace group so bash has read all of it before the first line runs: the git pull
# below can replace this very file without confusing the shell that is still executing it.
{
  set -euo pipefail

  APP_DIR="${APP_DIR:-/home/shesh/apps/cognify-staging}"
  SERVICE="${SERVICE:-cognify-backend}"
  SYSTEMCTL="${SYSTEMCTL:-sudo systemctl}"
  HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8000/}"
  BACKEND="$APP_DIR/Oral_bot/backend"

  cd "$APP_DIR"
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  PREVIOUS="$(git rev-parse HEAD)"
  echo "Deploying branch $BRANCH (now at ${PREVIOUS:0:7})"

  git pull --ff-only
  NEW="$(git rev-parse HEAD)"

  install_and_restart() {
    "$BACKEND/.venv/bin/pip" install -q -r "$BACKEND/requirements.txt"
    $SYSTEMCTL restart "$SERVICE"
  }

  healthy() {
    for _ in $(seq 1 20); do
      if curl -fs -o /dev/null "$HEALTH_URL"; then return 0; fi
      sleep 1
    done
    return 1
  }

  if install_and_restart && healthy; then
    echo "Deployed ${NEW:0:7}; $SERVICE is up."
    exit 0
  fi

  echo "Deploy of ${NEW:0:7} failed. Rolling back to ${PREVIOUS:0:7}." >&2
  git reset --hard "$PREVIOUS"
  install_and_restart || true
  if healthy; then echo "Rolled back; $SERVICE is up on ${PREVIOUS:0:7}." >&2; else echo "$SERVICE is DOWN after the rollback. Check journalctl -u $SERVICE." >&2; fi
  exit 1
}
