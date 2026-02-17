# Deployment Checklist

Use this checklist to ensure your deployment is configured correctly.

## Pre-Deployment

- [ ] WordPress site is running at `api.fitbody.mk`
- [ ] WordPress REST API is accessible at `https://api.fitbody.mk/wp-json/`
- [ ] WooCommerce is installed and configured
- [ ] Products are added to WordPress
- [ ] Custom API endpoints are implemented (see WORDPRESS_API_SETUP.md)
- [ ] CORS is configured on WordPress to allow your GitHub Pages domain

## GitHub Repository Setup

- [ ] Code is pushed to GitHub repository
- [ ] Repository is public (or you have GitHub Pro for private repos with Pages)
- [ ] GitHub Pages is enabled in repository settings
- [ ] Source is set to "GitHub Actions"

## Configuration Files

- [ ] `next.config.js` has correct API domain (api.fitbody.mk)
- [ ] `basePath` is set correctly if deploying to subdirectory
- [ ] `.github/workflows/deploy.yml` exists and is configured
- [ ] Environment variables are set in workflow file

## Optional Configuration

- [ ] Repository secret `SITE_URL` is set (if using custom URL)
- [ ] Custom domain CNAME file added to `public/` folder (if applicable)
- [ ] DNS records configured for custom domain (if applicable)
- [ ] Badge URL updated in README.md with your username/repo

## Testing

- [ ] Local build succeeds: `npm run build`
- [ ] Local site works with production API: `npm run dev`
- [ ] API endpoints return data correctly
- [ ] Images load from WordPress
- [ ] Cart functionality works
- [ ] Product pages load correctly

## Post-Deployment

- [ ] GitHub Action workflow completed successfully
- [ ] Site is accessible at GitHub Pages URL
- [ ] All pages load without errors
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Test cart and checkout flow
- [ ] Verify dealer portal works (if applicable)

## Monitoring

- [ ] Set up uptime monitoring (optional)
- [ ] Configure error tracking (optional)
- [ ] Monitor API response times
- [ ] Check GitHub Actions for failed builds

## Troubleshooting

If something doesn't work:

1. Check the Actions tab for build errors
2. Verify CORS configuration on WordPress
3. Test API endpoints directly with curl
4. Check browser console for JavaScript errors
5. Review [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed troubleshooting

## Maintenance

Regular tasks:

- [ ] Update dependencies: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review and merge Dependabot PRs
- [ ] Monitor WordPress API performance
- [ ] Backup WordPress database regularly

---

Last updated: [Date]
Deployment status: [ ] Not started | [ ] In progress | [ ] Complete
