# Deploy Cart Fix - Quick Guide

## Problem Solved
✅ Cart now persists multiple products (no more "only last product remains")
✅ Delete from cart now works (no more 500 errors)
✅ Cart works across domains (staging.fitbody.mk ↔ api.fitbody.mk)

## Files to Upload

Upload these 2 files to your WordPress server at `api.fitbody.mk`:

### Location: `/wp-content/themes/fitbody-ecommerce/`

1. **custom-cart.php** (NEW FILE)
2. **functions.php** (UPDATED)

## Quick Deployment Steps

### Step 1: Upload Files via FTP/cPanel
```
Local Path → Server Path
wordpress-theme/custom-cart.php → /wp-content/themes/fitbody-ecommerce/custom-cart.php
wordpress-theme/functions.php → /wp-content/themes/fitbody-ecommerce/functions.php
```

### Step 2: Create Database Table

**Option A - Automatic (Recommended)**
1. Go to WordPress Admin → Appearance → Themes
2. Activate any other theme
3. Activate "FitBody" theme again
4. Table will be created automatically

**Option B - Manual (via phpMyAdmin)**
1. Login to phpMyAdmin
2. Select your WordPress database
3. Click "SQL" tab
4. Paste and run this:

```sql
CREATE TABLE IF NOT EXISTS wp_fitbody_cart (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    session_token varchar(255) NOT NULL,
    user_id bigint(20) DEFAULT NULL,
    product_id bigint(20) NOT NULL,
    variation_id bigint(20) DEFAULT NULL,
    quantity int(11) NOT NULL DEFAULT 1,
    variation_data text DEFAULT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY session_token (session_token),
    KEY user_id (user_id),
    KEY product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Verify Table Exists
In phpMyAdmin, run:
```sql
SHOW TABLES LIKE 'wp_fitbody_cart';
```

You should see the table listed.

### Step 4: Test Cart
1. Go to https://staging.fitbody.mk
2. Add a product to cart
3. Add another product to cart
4. Open cart - both products should be there
5. Try removing a product - should work without errors
6. Refresh page - cart should persist

## What Changed

### Before (Broken)
- Used WooCommerce sessions (cookie-based)
- Cookies don't work across domains
- Only last product remained in cart
- Delete returned 500 errors

### After (Fixed)
- Custom database table for cart storage
- Uses `X-Cart-Session` header (works across domains)
- All products persist correctly
- Delete works properly

## Troubleshooting

### Cart Still Not Working?

**1. Check if table was created:**
```sql
SELECT * FROM wp_fitbody_cart;
```

**2. Check WordPress error log:**
```bash
tail -f /path/to/wp-content/debug.log
```

**3. Check browser console:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed API requests

**4. Verify X-Cart-Session header:**
- Open DevTools → Network tab
- Add product to cart
- Click the cart API request
- Check Headers tab
- Should see `X-Cart-Session` in both Request and Response

### Still Having Issues?

Check these files exist on server:
- `/wp-content/themes/fitbody-ecommerce/custom-cart.php`
- `/wp-content/themes/fitbody-ecommerce/functions.php`

Make sure functions.php includes this line near the top:
```php
require_once get_template_directory() . '/custom-cart.php';
```

## No Frontend Changes Needed

The frontend already has the correct implementation. Only backend files need to be uploaded.

## Success Indicators

✅ Multiple products stay in cart
✅ Cart persists after page refresh
✅ Delete button works without errors
✅ Cart works for guest users
✅ Cart works for logged-in users
✅ Dealer prices apply correctly

## Questions?

See `CART_IMPLEMENTATION_COMPLETE.md` for detailed documentation.
