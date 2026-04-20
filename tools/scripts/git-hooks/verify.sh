#!/bin/sh
# ===========================================
# verify.sh — unified local Git checks
# Enforces:
#   1. Branch naming convention (feature/fix/hotfix)
#   2. Conventional Commit format
#   3. Branch name validation on checkout, commit, and push
#   4. Exceptions for main, stable, vX, vX-dev
# ===========================================

# -------------------------------
# CONFIGURATION
# -------------------------------
BRANCH_PATTERN='^(feature|fix|hotfix)\/[A-Za-z0-9._-]+$'
COMMIT_PATTERN='^(feat|fix|docs|style|refactor|test|chore)(\([A-Za-z0-9._-]+\))?: .+'
EXCEPTION_PATTERN='^(main|stable|v[0-9]+(-dev)?)$'

# -------------------------------
# Function: verify_branch_name
# -------------------------------
verify_branch_name() {
  branch_name=$(git symbolic-ref --short HEAD 2>/dev/null)

  # Skip detached HEADs
  if [ -z "$branch_name" ]; then
    return 0
  fi

  # Skip exception branches
  if echo "$branch_name" | grep -Eq "$EXCEPTION_PATTERN"; then
    return 0
  fi

  # Enforce naming convention
  if ! echo "$branch_name" | grep -Eq "$BRANCH_PATTERN"; then
    echo "❌ Invalid branch name: '$branch_name'"
    echo ""
    echo "✅ Branch names must start with one of:"
    echo "   feature/, fix/, or hotfix/"
    echo ""
    echo "Examples:"
    echo "   feature/add-login-endpoint"
    echo "   fix/missing-header"
    echo "   hotfix/critical-db-timeout"
    echo ""
    echo "Allowed special branches:"
    echo "   main, stable, v1, v1-dev, v5, v5-dev, etc."
    exit 1
  fi
}

# -------------------------------
# Function: verify_commit_message
# -------------------------------
verify_commit_message() {
  commit_msg_file="$1"
  commit_msg=$(cat "$commit_msg_file")

  if ! echo "$commit_msg" | grep -Eq "$COMMIT_PATTERN"; then
    echo "❌ Invalid commit message:"
    echo "    $commit_msg"
    echo ""
    echo "Commit messages must follow Conventional Commits format:"
    echo "    <type>(optional scope): <description>"
    echo ""
    echo "Examples:"
    echo "    feat(auth): add login endpoint"
    echo "    fix: correct nil pointer on startup"
    exit 1
  fi
}

# -------------------------------
# Hook mode detection
# -------------------------------
HOOK_NAME=$(basename "$0")

case "$HOOK_NAME" in
  post-checkout)
    verify_branch_name
    ;;
  pre-push)
    verify_branch_name
    ;;
  commit-msg)
    verify_commit_message "$1"
    ;;
  *)
    echo "⚠️  This script is intended for use as 'post-checkout', 'pre-push', and 'commit-msg' hooks."
    ;;
esac

exit 0

