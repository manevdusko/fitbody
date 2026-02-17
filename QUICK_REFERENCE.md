# Quick Reference Card

Essential information for FitBody platform at a glance.

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run verify           # Check deployment readiness

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
npm run type-check       # Validate TypeScript

# Deployment
git push origin main     # Deploy to GitHub Pages (automatic)
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variables template |
| `src/utils/api.ts` | API client |
| `src/types/index.ts` | TypeScript types |

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| **API Backend** | https://api.fitbody.mk |
| **WordPress API** | https://api.fitbody.mk/wp-json/wp/v2 |
| **Custom API** | https://api.fitbody.mk/wp-json/fitbody/v1 |
| **GitHub Actions** | Repository → Actions tab |
| **GitHub Pages** | Repository → Settings → Pages |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment guide |
| [COMMANDS.md](COMMANDS.md) | All commands |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](SECURITY.md) | Security policy |
| [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md) | WordPress config |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture |
| [DEPLOYMENT_READY_CHECKLIST.md](DEPLOYMENT_READY_CHECKLIST.md) | Pre-deployment checklist |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | All documentation |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Styled Components
- **State**: React Query, Context API
- **Backend**: WordPress + WooCommerce (Headless)
- **Deployment**: GitHub Pages (Static)
- **CI/CD**: GitHub Actions

## 🔐 Environment Variables

```bash
# Required
WORDPRESS_API_URL=https://api.fitbody.mk/wp-json/wp/v2
WOOCOMMERCE_API_URL=https://api.fitbody.mk/wp-json/wc/v3
NEXT_PUBLIC_SITE_URL=https://fitbody.mk
NEXT_PUBLIC_APP_NAME=FitBody.mk

# Optional
BASE_PATH=/repo-name  # For subdirectory deployment
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm run type-check` and `npm run lint` |
| CORS errors | Check WordPress CORS configuration |
| 404 on routes | Verify `trailingSlash: true` in next.config.js |
| Images not loading | Check `images.domains` in next.config.js |
| API errors | Test API directly: `curl https://api.fitbody.mk/wp-json/` |

## 📞 Support

- **Email**: fitbody.mk@icloud.com
- **Security**: security@fitbody.mk
- **Issues**: GitHub Issues tab
- **Docs**: See DOCUMENTATION_INDEX.md

## ✅ Pre-Deployment Checklist

- [ ] `npm install` completed
- [ ] `npm run verify` passes
- [ ] `npm run build` succeeds
- [ ] WordPress API accessible
- [ ] CORS configured
- [ ] GitHub Pages enabled
- [ ] Environment variables set

## 🎯 Common Tasks

### Setup New Environment
```bash
git clone <repo-url>
cd fitbody-ecommerce
npm install
cp .env.local.example .env.local
npm run dev
```

### Deploy to Production
```bash
git add .
git commit -m "feat: your changes"
git push origin main
# GitHub Actions deploys automatically
```

### Update Dependencies
```bash
npm outdated          # Check for updates
npm update            # Update minor versions
npm audit             # Check security
npm audit fix         # Fix vulnerabilities
```

### Fix Code Issues
```bash
npm run lint:fix      # Fix linting
npm run type-check    # Check types
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/your-feature
# Create PR on GitHub
```

## 📊 Quality Metrics

- **TypeScript**: Strict mode ✅
- **Linting**: ESLint configured ✅
- **Security**: Headers + secure cookies ✅
- **Performance**: Static generation ✅
- **Documentation**: 15+ guides ✅

## 🚨 Emergency Contacts

| Issue | Action |
|-------|--------|
| **Site Down** | Check GitHub Pages status, WordPress API |
| **Security Issue** | Email security@fitbody.mk immediately |
| **Build Failure** | Check GitHub Actions logs |
| **API Errors** | Verify WordPress is running |

## 📈 Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 1 second
- **Lighthouse Score**: > 90
- **Build Time**: < 5 minutes

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [WooCommerce API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

## 💡 Pro Tips

1. **Use `npm run verify`** before every deployment
2. **Run `npm audit`** regularly for security
3. **Keep dependencies updated** monthly
4. **Test locally** before pushing
5. **Read error messages** carefully
6. **Check GitHub Actions logs** for deployment issues
7. **Use TypeScript** for type safety
8. **Follow commit conventions** for clean history

---

**Quick Links**: [Docs](DOCUMENTATION_INDEX.md) | [Deploy](DEPLOYMENT.md) | [API](WORDPRESS_API_SETUP.md) | [Help](CONTRIBUTING.md)

**Version**: 1.0.0 | **Status**: 🚀 Production Ready
