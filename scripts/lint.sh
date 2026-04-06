#!/bin/bash
set -e
# Corepack pnpm
pnpm lint
pnpm build
echo "Linting and Build successful."
