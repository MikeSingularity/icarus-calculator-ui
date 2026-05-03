#!/usr/bin/env bash

set -e
set -o pipefail

get_project_root() {
    local dir="$1"
    while [[ "$dir" != "/" ]]; do
        if [[ -d "$dir/.git" ]]; then
            echo "$dir"
            return
        fi
        dir="$(dirname "$dir")"
    done
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
}

PROJECT_ROOT="${PROJECT_ROOT:-${VSCODE_CWD:-$(get_project_root "$PWD")}}"

export SOURCE_ESLINT_CONFIG="${AI_CONFIG_ROOT}/languages/typescript/eslint.config.js"

if [ ! -d "${PROJECT_ROOT}/logs" ]; then
    mkdir -p "${PROJECT_ROOT}/logs"
fi
LINT_LOG="${PROJECT_ROOT}/logs/lint.log"
if [ -f "${LINT_LOG}" ]; then
    echo "Clearing existing lint log at ${LINT_LOG}" 
    rm -f "${LINT_LOG}"
fi

echo "Running Prettier Formatter..." | tee -a "${LINT_LOG}"
pnpm exec prettier --write . 2>&1 | tee -a "${LINT_LOG}"

echo "Running ESLint (auto-fix)..." | tee -a "${LINT_LOG}"
pnpm exec eslint --config eslint.config.js --fix . 2>&1 | tee -a "${LINT_LOG}"

echo "Running TypeScript Compiler (Type Verification)..." | tee -a "${LINT_LOG}"
pnpm exec tsc -p tsconfig.json --noEmit 2>&1 | tee -a "${LINT_LOG}"

echo "Completed successfully at $(date)" | tee -a "${LINT_LOG}"
