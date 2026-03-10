#!/bin/bash
set -euo pipefail

if [ -z "${MONGO_APP_DB:-}" ] || [ -z "${MONGO_APP_USERNAME:-}" ] || [ -z "${MONGO_APP_PASSWORD:-}" ]; then
  echo "Mongo app user/database variables are not set; skipping app user initialization."
  exit 0
fi

echo "Initializing Mongo app database and user..."
mongosh --quiet <<EOF
const appDb = db.getSiblingDB('${MONGO_APP_DB}');
appDb.createUser({
  user: '${MONGO_APP_USERNAME}',
  pwd: '${MONGO_APP_PASSWORD}',
  roles: [{ role: 'readWrite', db: '${MONGO_APP_DB}' }]
});
EOF

echo "Mongo app database and user initialization complete."
