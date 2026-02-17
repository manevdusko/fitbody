# Deployment Guide - GitHub Pages

This guide explains how to deploy your FitBody Next.js application to GitHub Pages, fetching data from your WordPress API at api.fitbody.mk.

## Overview

The application is now configured to:
- Deploy automatically to GitHub Pages via GitHub Actions
- Fetch all data from `api.fitbody.mk` WordPress API
- Build as a static site (no server required)
- Update automatically on every push to the main branch

## Prerequisites

1. GitHub repository for your project
2. WordPress site running at `api.fitbody.mk` with REST API enabled
3. CORS configured on your WordPress site to allow requests from your GitHub Pages domain

## Setup Instructions

### 1. Configure WordPress CORS

Add this to your WordPress `functions.php` or a custom plugin:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save the settings

### 3. Configure Repository Secrets (Optional)

If you want to customize the site URL, add a repository secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `SITE_URL`
   - Value: Your GitHub Pages URL (e.g., `https://yourusername.github.io/fitbody`)

### 4. Update Base Path (if needed)

If your site is deployed to a subdirectory (e.g., `https://yourusername.github.io/fitbody`), uncomment and update the `basePath` in `next.config.js`:

```javascript
basePath: '/fitbody',
```

### 5. Push to GitHub

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
1. Install dependencies
2. Build the Next.js site
3. Deploy to GitHub Pages

## Deployment Workflow

The deployment happens automatically via `.github/workflows/deploy.yml`:

- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Build**: Installs dependencies and builds the static site
- **Deploy**: Uploads the `out` folder to GitHub Pages

## Environment Variables

The following environment variables are configured in the workflow:

- `WORDPRESS_API_URL`: https://api.fitbody.mk/wp-json/wp/v2
- `WOOCOMMERCE_API_URL`: https://api.fitbody.mk/wp-json/wc/v3
- `NEXT_PUBLIC_SITE_URL`: Your GitHub Pages URL
- `NEXT_PUBLIC_APP_NAME`: FitBody.mk

## Local Development

To test locally with the production API:

```bash
# Copy the environment file
cp .env.local.example .env.local

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will fetch data from `api.fitbody.mk` even in development mode.

## Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Verify CORS headers are configured on api.fitbody.mk
- Check that your GitHub Pages domain is allowed
- Test the API directly: `curl -I https://api.fitbody.mk/wp-json/wp/v2/posts`

### 404 Errors on Routes

If you get 404 errors on page refresh:
- GitHub Pages doesn't support client-side routing by default
- The app uses `trailingSlash: true` to help with this
- Consider adding a custom 404.html that redirects to index.html

### Images Not Loading

If images from WordPress aren't loading:
- Verify the image URLs in the API response
- Check that `api.fitbody.mk` is in the `images.domains` array in `next.config.js`
- Ensure images are publicly accessible

### Build Fails

If the GitHub Action build fails:
- Check the Actions tab for error logs
- Verify all dependencies are in `package.json`
- Test the build locally: `npm run build`

## Monitoring

- View deployment status: **Actions** tab in GitHub
- View live site: Your GitHub Pages URL
- Check build logs: Click on any workflow run in Actions

## Custom Domain (Optional)

To use a custom domain instead of github.io:

1. Add a `CNAME` file to the `public` folder with your domain
2. Configure DNS records to point to GitHub Pages
3. Enable HTTPS in repository settings

## Removing WordPress Theme

Since you're now deploying to GitHub Pages, you can safely remove the `wordpress-theme` folder:

```bash
rm -rf wordpress-theme
rm -rf wordpress-integration
```

These are no longer needed as the frontend is completely separate from WordPress.
