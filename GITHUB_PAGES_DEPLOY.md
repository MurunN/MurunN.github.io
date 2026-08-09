# SteppeQuest — GitHub Pages deployment

This folder is a static GitHub Pages edition of SteppeQuest.

## Important
GitHub Pages only serves static files. The visual site, timeline, map, culture sections, target archery and horse relay games work in this edition. Google login, Prisma database, admin panel and server API routes are intentionally removed.

## Recommended repository name
Create a repository named exactly:

`YOUR_GITHUB_USERNAME.github.io`

Using a user-site repository keeps SteppeQuest at the root URL and ensures all current `/images`, `/audio`, and game links work without an additional repository base path.

## Publish
From this folder:

```bash
git init
git branch -M main
git add .
git commit -m "Publish SteppeQuest"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io.git
git push -u origin main
```

Then in GitHub:

1. Open the repository.
2. Settings → Pages.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Open the **Actions** tab and wait for `Deploy SteppeQuest to GitHub Pages` to finish.
5. Visit `https://YOUR_GITHUB_USERNAME.github.io/`.

Subsequent pushes to `main` deploy automatically.

## One-command helper on macOS
If you have GitHub CLI installed and authenticated, this project includes:

```bash
./deploy-github-pages.sh
```

The script detects your GitHub username, creates `<username>.github.io` if needed, commits the project and pushes `main`.
