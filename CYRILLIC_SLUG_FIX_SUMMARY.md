# Cyrillic Product Slug Issue - Summary & Solution

## Current Problem

Product URLs with Cyrillic characters (e.g., `https://staging.fitbody.mk/products/чашка-шејќер-500мл/`) are returning 404 errors.

## Root Cause

The issue has two parts:

1. **Frontend (Next.js)**: The slug comes URL-encoded from the router, and the API client needs to handle it properly
2. **Backend (WordPress API)**: The WordPress API endpoint needs to properly decode and find products with Cyrillic slugs

## What We've Done

### Frontend Changes (Already Deployed)
- Updated `src/utils/api.ts` to decode URL-encoded slugs before sending to API
- Added fallback method that searches for products if direct slug lookup fails
- File: `src/utils/api.ts` - `getBySlug()` function

### Backend Changes (Needs Upload to api.fitbody.mk)
- Updated `wordpress-theme/functions.php` to use `wc_get_products()` with slug parameter
- This method handles Cyrillic characters better than `get_page_by_path()`
- File: `wordpress-theme/functions.php` - `fitbody_proxy_woocommerce_product_by_slug()` function

## What Needs to Be Done

### Step 1: Upload Updated functions.php to WordPress

You need to upload the updated `wordpress-theme/functions.php` file to your WordPress site at `api.fitbody.mk`.

**Location on WordPress server:**
```
/wp-content/themes/fitbody-ecommerce/functions.php
```

**How to upload:**
1. Via FTP/SFTP: Upload the file to the theme directory
2. Via cPanel File Manager: Navigate to the theme directory and upload
3. Via WordPress admin: Appearance → Theme File Editor (not recommended for large files)

### Step 2: Test the API Directly

After uploading, test the API endpoint directly to verify it works:

```bash
# Test with Cyrillic slug (URL-encoded)
curl "https://api.fitbody.mk/wp-json/fitbody/v1/products/slug/%D1%87%D0%B0%D1%88%D0%BA%D0%B0-%D1%88%D0%B5%D1%98%D1%9C%D0%B5%D1%80-500%D0%BC%D0%BB"

# Test with English slug
curl "https://api.fitbody.mk/wp-json/fitbody/v1/products/slug/iso-touch-100-protein-2kg"
```

Both should return product data (not 404).

### Step 3: Clear WordPress Cache

If you're using any caching plugins (WP Super Cache, W3 Total Cache, etc.), clear the cache after uploading the new functions.php file.

### Step 4: Test on Staging Site

Once the WordPress API is updated, test the product URLs on staging:
- https://staging.fitbody.mk/products/iso-touch-100-protein-2kg/
- https://staging.fitbody.mk/products/чашка-шејќер-500мл/

## Alternative Solution (If Above Doesn't Work)

If the WordPress API still can't find products by Cyrillic slug, we have a fallback already implemented in the frontend that:

1. Tries the direct slug endpoint first
2. If that fails, fetches all products with a search query
3. Finds the exact match by comparing slugs

This fallback is already deployed on staging.fitbody.mk.

## Technical Details

### WordPress API Endpoint
```php
// Endpoint registration (already correct)
register_rest_route('fitbody/v1', '/products/slug/(?P<slug>[^/]+)', [
    'methods'  => 'GET',
    'callback' => 'fitbody_proxy_woocommerce_product_by_slug_multilang',
    'permission_callback' => '__return_true',
]);
```

The regex `[^/]+` allows any characters except forward slashes, including Cyrillic.

### Updated Function Logic
```php
// New approach using wc_get_products()
$products = wc_get_products([
    'slug' => $decoded_slug,
    'status' => 'publish',
    'limit' => 1,
]);
```

This is more reliable than `get_page_by_path()` for finding products with special characters.

## Debugging

If issues persist, check WordPress error logs:
```bash
# Location of WordPress error log
/wp-content/debug.log
```

Enable WordPress debugging in `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Status

- ✅ Frontend code updated and deployed
- ⏳ Backend code updated but NOT uploaded to api.fitbody.mk yet
- ⏳ Waiting for WordPress functions.php upload

## Next Steps

1. Upload `wordpress-theme/functions.php` to `api.fitbody.mk`
2. Test API endpoints directly
3. Test product URLs on staging site
4. If working, update production domain
