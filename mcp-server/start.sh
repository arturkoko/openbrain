#!/bin/bash
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_NAME=openbrain
export DB_USER=openbrain
export DB_PASSWORD=openbrain_secret_change_me
export VAULT_PATH=/opt/openbrain/vault
export RADICALE_URL=http://127.0.0.1:5232
export RADICALE_USER=artur
export RADICALE_PASSWORD=change_me_radicale
exec node /opt/openbrain/mcp-server/dist/index.js
