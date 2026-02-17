# Quick Start Guide

Get your FitBody site deployed to GitHub Pages in 5 minutes!

## Step 1: Fork or Clone

```bash
git clone https://github.com/yourusername/fitbody-ecommerce.git
cd fitbody-ecommerce
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Test Locally (Optional)

```bash
# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000 to see your site running locally with data from api.fitbody.mk.

## Step 4: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/yourrepo.git
git branch -M main
git push -u origin main
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. That's it! Your site will deploy automatically.

## Step 6: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow run
3. Once complete (green checkmark), your site is live!

## Step 7: Access Your Site

Your site will be available at:
```
https://yourusername.github.io/yourrepo/
```

## Customization

### Update Site URL

If deploying to a subdirectory, update `next.config.js`:

```javascript
basePath: '/yourrepo',
```

### Custom Domain

1. Add a `CNAME` file to the `public` folder with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

## Troubleshooting

### Build Fails
- Check the Actions tab for error logs
- Ensure all dependencies are installed
- Test locally: `npm run build`

### CORS Errors
- Verify CORS is configured on api.fitbody.mk
- See [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md)

### Images Not Loading
- Check that api.fitbody.mk is in `next.config.js` images.domains
- Verify image URLs in API responses

## Next Steps

- Customize colors and branding in `src/styles/`
- Update translations in `src/translations/`
- Add your products in WordPress at api.fitbody.mk
- Configure dealer portal settings

## Need Help?

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- Check [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md) for API setup
- Create an issue on GitHub

---

Happy deploying! 🚀
