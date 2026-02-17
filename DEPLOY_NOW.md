# Deploy to GitHub Pages - Quick Guide

## Your Configuration

- **GitHub Username**: manevdusko
- **Repository**: fitbody
- **Site URL**: https://manevdusko.github.io/fitbody/
- **API Backend**: https://api.fitbody.mk

## Step 1: Push to GitHub

```bash
# If you haven't initialized git yet
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FitBody e-commerce platform"

# Add remote (if not already added)
git remote add origin https://github.com/manevdusko/fitbody.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Enable GitHub Pages

1. Go to: **https://github.com/manevdusko/fitbody/settings/pages**

2. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**
   
3. Click **Save** (if there's a save button)

## Step 3: Wait for Deployment

1. Go to: **https://github.com/manevdusko/fitbody/actions**

2. Watch the workflow run (takes 2-5 minutes)

3. Wait for green checkmark ✅

## Step 4: Visit Your Site

Your site will be live at:
```
https://manevdusko.github.io/fitbody/
```

## WordPress CORS Configuration

Make sure your WordPress at `api.fitbody.mk` allows requests from your GitHub Pages domain.

Add this to your WordPress `functions.php` or create a plugin:

```php
<?php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://manevdusko.github.io');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
        
        return $value;
    });
}, 15);
```

## Troubleshooting

### If deployment fails:
1. Check Actions tab for error logs
2. Verify all files are committed
3. Make sure GitHub Pages is enabled

### If site shows 404:
1. Wait a few minutes (can take up to 10 minutes)
2. Clear browser cache
3. Try incognito/private window

### If API doesn't work:
1. Check CORS is configured on WordPress
2. Test API directly: `curl https://api.fitbody.mk/wp-json/`
3. Check browser console for CORS errors

## Next Steps

After successful deployment:

1. ✅ Test all pages
2. ✅ Test product browsing
3. ✅ Test cart functionality
4. ✅ Test on mobile
5. ✅ Check browser console for errors

## Custom Domain (Optional)

If you want to use `fitbody.mk` instead of `manevdusko.github.io/fitbody`:

1. Add a `CNAME` file to `public` folder with content: `fitbody.mk`
2. Configure DNS A records to point to GitHub Pages IPs
3. Enable HTTPS in repository settings

---

**Your site will be live at**: https://manevdusko.github.io/fitbody/

Good luck! 🚀
