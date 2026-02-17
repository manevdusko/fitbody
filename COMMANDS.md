# Useful Commands

Quick reference for common development and deployment tasks.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## Building

```bash
# Build for production
npm run build

# Test production build locally
npm run deploy:test

# Verify deployment readiness
npm run verify
```

## Deployment

```bash
# Push to GitHub (triggers automatic deployment)
git add .
git commit -m "Your commit message"
git push origin main

# View deployment status
# Go to: https://github.com/yourusername/yourrepo/actions
```

## Testing

```bash
# Run linter
npm run lint

# Check for type errors (if using TypeScript)
npx tsc --noEmit

# Test API connection
curl https://api.fitbody.mk/wp-json/wp/v2/posts
```

## Maintenance

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix

# Clean build artifacts
rm -rf .next out node_modules/.cache
```

## Git Operations

```bash
# Check status
git status

# View commit history
git log --oneline

# Create new branch
git checkout -b feature/your-feature

# Switch branches
git checkout main

# Pull latest changes
git pull origin main

# View remote URL
git remote -v
```

## Troubleshooting

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version

# Check npm version
npm --version

# View environment variables
npm run env
```

## WordPress API Testing

```bash
# Test WordPress API
curl https://api.fitbody.mk/wp-json/wp/v2

# Test products endpoint
curl https://api.fitbody.mk/wp-json/fitbody/v1/products

# Test with parameters
curl "https://api.fitbody.mk/wp-json/fitbody/v1/products?per_page=5"

# Test specific product
curl https://api.fitbody.mk/wp-json/fitbody/v1/products/123
```

## GitHub Actions

```bash
# View workflow runs
gh run list

# View specific run
gh run view [run-id]

# Re-run failed workflow
gh run rerun [run-id]

# Watch workflow in real-time
gh run watch
```

Note: Requires [GitHub CLI](https://cli.github.com/) to be installed.

## Environment Setup

```bash
# Copy environment file
cp .env.local.example .env.local

# Edit environment file
# Windows: notepad .env.local
# Mac/Linux: nano .env.local
```

## Performance Testing

```bash
# Analyze bundle size
npm run build
# Check the output for bundle sizes

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Check for unused dependencies
npx depcheck
```

## Code Quality

```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Useful Aliases (Optional)

Add these to your `.bashrc` or `.zshrc`:

```bash
alias dev="npm run dev"
alias build="npm run build"
alias deploy="git push origin main"
alias verify="npm run verify"
```

## Quick Deployment Checklist

```bash
# 1. Verify everything is ready
npm run verify

# 2. Build locally to test
npm run build

# 3. Commit changes
git add .
git commit -m "Update: description of changes"

# 4. Push to GitHub
git push origin main

# 5. Monitor deployment
# Visit: https://github.com/yourusername/yourrepo/actions
```

## Emergency Rollback

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git revert HEAD

# Or reset to specific commit (use with caution!)
git reset --hard [commit-hash]
git push --force origin main
```

⚠️ **Warning**: Force push will overwrite remote history. Use only in emergencies.

## Getting Help

```bash
# Next.js help
npx next --help

# npm help
npm help

# Git help
git help

# View this project's README
cat README.md
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

---

For more detailed information, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md) - API setup
