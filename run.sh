#!/bin/bash
# exec-deploy launcher
# Usage: ./run.sh <command> [options]

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# First-time setup
if [ "$1" = "setup" ]; then
  echo "exec-deploy setup"
  echo "────────────────"

  if [ ! -f .env ]; then
    echo "Creating .env..."
    touch .env
  fi

  read -p "ANTHROPIC_API_KEY (sk-ant-...): " api_key
  read -p "ADZUNA_APP_ID (from developer.adzuna.com): " adzuna_id
  read -p "ADZUNA_APP_KEY: " adzuna_key

  echo "ANTHROPIC_API_KEY=$api_key"  >> .env
  echo "ADZUNA_APP_ID=$adzuna_id"    >> .env
  echo "ADZUNA_APP_KEY=$adzuna_key"  >> .env

  echo ""
  echo "✓ Keys saved to .env"
  echo "  Run: npm install"
  echo "  Then: ./run.sh search"
  exit 0
fi

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check node_modules
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install --silent
fi

# Pass all args to node
node index.js "$@"
