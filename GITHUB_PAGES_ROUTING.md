# GitHub Pages Routing for Dynamic Content

## How It Works

This site uses a client-side routing solution for GitHub Pages that allows dynamic routes (like `/products/[slug]` and `/blog/[slug]`) to work with content fetched from the WordPress API.

## The Problem

GitHub Pages is a static file server. When a user visits `staging.fitbody.mk/products/some-product/`, GitHub Pages looks for a file at that path. If it doesn't exist, it returns a 404 error.

## The Solution

We use a two-step redirect process:

### Step 1: 404.html Redirect
When GitHub Pages can't find a file, it serves `public/404.html`, which contains a script that:
- Takes the current URL path (e.g., `/products/some-product/`)
- Converts it to a query parameter (e.g., `/?/products/some-product/`)
- Redirects the browser to this new URL

### Step 2: Client-Side Route Restoration
In `pages/_document.tsx`, a script runs on every page load that:
- Checks if the URL has the special query parameter format
- Converts it back to the original path (e.g., `/products/some-product/`)
- Updates the browser history without reloading

### Step 3: Next.js Routing
Once the URL is restored, Next.js router takes over:
- Matches the route to the appropriate page component
- The component fetches data from the WordPress API
- Content is rendered client-side

## Benefits

1. **No Pre-Generation Required**: Products and blog posts don't need to be pre-generated at build time
2. **Always Up-to-Date**: New content added to WordPress is immediately available
3. **No Rebuild Needed**: Adding new products/posts doesn't require redeploying the site
4. **SEO-Friendly**: The URL structure remains clean and readable

## Files Involved

- `public/404.html` - Handles the initial redirect
- `pages/_document.tsx` - Restores the original URL
- `pages/products/[slug].tsx` - Fetches product data from API
- `pages/blog/[slug].tsx` - Fetches blog post data from API

## Limitations

- Initial page load requires two redirects (minimal performance impact)
- Direct links show a brief "Redirecting..." message
- Search engines may need time to index the redirected URLs

## Alternative Considered

We considered using `getStaticPaths` to pre-generate all product/blog pages at build time, but this would require:
- Rebuilding and redeploying every time new content is added
- Managing a list of all product/blog slugs
- Longer build times as content grows

The current solution provides better flexibility for a headless CMS architecture.
