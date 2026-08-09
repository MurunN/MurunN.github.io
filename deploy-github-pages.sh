#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is required."
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed. On macOS: brew install gh"
  echo "Then run: gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

USER_NAME="$(gh api user --jq .login)"
REPO_NAME="${USER_NAME}.github.io"

printf '\nGitHub user: %s\nRepository: %s\nURL after deploy: https://%s.github.io/\n\n' "$USER_NAME" "$REPO_NAME" "$USER_NAME"

if [ ! -d .git ]; then
  git init
fi

git checkout -B main
git add .
if ! git diff --cached --quiet; then
  git commit -m "Publish SteppeQuest to GitHub Pages"
fi

if gh repo view "$USER_NAME/$REPO_NAME" >/dev/null 2>&1; then
  echo "Repository already exists."
else
  gh repo create "$REPO_NAME" --public --source=. --remote=origin
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/${USER_NAME}/${REPO_NAME}.git"
fi

git push -u origin main

# Enable GitHub Pages with GitHub Actions when the current gh token has permission.
if gh api "repos/${USER_NAME}/${REPO_NAME}/pages" >/dev/null 2>&1; then
  gh api --method PUT "repos/${USER_NAME}/${REPO_NAME}/pages" -f build_type=workflow >/dev/null 2>&1 || true
else
  gh api --method POST "repos/${USER_NAME}/${REPO_NAME}/pages" -f build_type=workflow >/dev/null 2>&1 || true
fi

echo
printf 'Code pushed. In GitHub open Settings → Pages and choose GitHub Actions if it is not already selected.\n'
printf 'Then watch the Actions tab. Your site will be: https://%s.github.io/\n' "$USER_NAME"
