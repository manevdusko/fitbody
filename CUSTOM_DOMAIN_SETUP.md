# Custom Domain Setup for GitHub Pages

## Current Setup
- **Repository**: manevdusko/fitbody
- **Current URL**: https://manevdusko.github.io/fitbody/
- **Future Domain**: fitbody.mk (or your chosen domain)

## When You Buy Your Domain

### Step 1: Add CNAME File

Create a file named `CNAME` in the `public` folder with your domain:

```bash
# Create CNAME file
echo "fitbody.mk" > public/CNAME
```

Or if you want to use www:
```bash
echo "www.fitbody.mk" > public/CNAME
```

### Step 2: Configure DNS Records

In your domain registrar's DNS settings, add these records:

#### Option A: Apex Domain (fitbody.mk)

Add these A records:
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

Add CNAME for www:
```
Type: CNAME
Name: www
Value: manevdusko.github.io
```

#### Option B: Subdomain (www.fitbody.mk)

Add CNAME record:
```
Type: CNAME
Name: www
Value: manevdusko.github.io
```

### Step 3: Update GitHub Repository Settings

1. Go to: https://github.com/manevdusko/fitbody/settings/pages
2. Under "Custom domain", enter: `fitbody.mk`
3. Click "Save"
4. Wait for DNS check (can take up to 24 hours)
5. Enable "Enforce HTTPS" once DNS is verified

### Step 4: Update Configuration Files

Update `.github/workflows/deploy.yml`:

```yaml
NEXT_PUBLIC_SITE_URL: https://fitbody.mk
```

Update WordPress CORS to allow your new domain:

```php
header('Access-Control-Allow-Origin: https://fitbody.mk');
```

### Step 5: Commit and Deploy

```bash
git add public/CNAME .github/workflows/deploy.yml
git commit -m "Add custom domain configuration"
git push origin main
```

## DNS Propagation

- DNS changes can take 24-48 hours to propagate globally
- Use https://dnschecker.org to check propagation status
- Test with: `dig fitbody.mk` or `nslookup fitbody.mk`

## SSL Certificate

- GitHub Pages automatically provides SSL certificate
- It may take a few minutes to provision after DNS verification
- Always use HTTPS for security

## Troubleshooting

### Domain not working after 24 hours:
1. Verify DNS records are correct
2. Check DNS propagation: https://dnschecker.org
3. Clear browser cache
4. Try incognito/private window

### SSL certificate error:
1. Wait 24 hours for DNS propagation
2. Disable and re-enable "Enforce HTTPS" in GitHub settings
3. Check that CNAME file exists in repository

### 404 errors:
1. Verify CNAME file is in `public` folder
2. Check GitHub Pages settings show correct domain
3. Rebuild and redeploy

## Current Temporary Setup

For now, your site works at:
- **https://manevdusko.github.io/fitbody/**

The configuration is already set up to work with a custom domain - you just need to:
1. Buy the domain
2. Add CNAME file
3. Configure DNS
4. Update GitHub settings

Everything else is ready! 🚀

## Recommended Domain Registrars

- **Namecheap** - Good prices, easy DNS management
- **Google Domains** - Simple interface, reliable
- **Cloudflare** - Free DNS, good performance
- **GoDaddy** - Popular, but more expensive

## Cost

- Domain: ~$10-15/year for .mk domain
- GitHub Pages: FREE
- SSL Certificate: FREE (included with GitHub Pages)
- Total: Just the domain cost!

---

**Note**: Keep the repository name as `fitbody` - it doesn't matter once you add a custom domain!
