#!/usr/bin/env bash
#
# Helper script to discover and list all active workflows.
# Satisfies the MANDATORY session initialization requirements.
#

set -e

for i in "${HOME}/.agents/workflows" \
         "${HOME}/.agents/skills" \
         ".agents/workflows" \
         ".agents/skills"; do

    echo "----"
    if [ -d "$i" ]; then
        tree -lDL 5 "${i}"
        echo ""
    else
        echo "Directory $i does not exist, skipping."
    fi
done
