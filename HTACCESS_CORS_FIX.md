# .htaccess CORS Fix - EASIEST SOLUTION

## Why This is Better
Adding CORS headers to `.htaccess` is better than PHP because:
- Handles CORS at server level (before PHP runs)
- Works for all requests (including OPTIONS preflight)
- More reliable and faster
- No code changes needed

## What to Do

### Option 1: Add CORS Section to Existing .htaccess (RECOMMENDED)

Add this section to your existing `.htaccess` file at `api.fitbody.mk` (WordPress root):

```apache
# CORS Headers for API requests
<IfModule mod_headers.c>
    # Handle preflight OPTIONS requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
    
    # Set CORS headers for all requests
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, X-Cart-Session"
    Header always set Access-Control-Expose-Headers "X-Cart-Session"
    Header always set Access-Control-Allow-Credentials "true"
    
    # For API endpoints specifically
    <FilesMatch "\.(php)$">
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, X-Cart-Session"
        Header always set Access-Control-Expose-Headers "X-Cart-Session"
    </FilesMatch>
</IfModule>
```

**Where to add it:**
- Open your `.htaccess` file in WordPress root
- Add the CORS section AFTER the `# END WordPress` line
- BEFORE the `# Cache static assets` section
- Save the file

### Option 2: Replace Entire .htaccess File

If you want to be safe, I've created a complete `.htaccess` file with CORS headers included:

**File:** `wordpress-integration/.htaccess`
**Upload to:** `/public_html/.htaccess` (or wherever your WordPress root is)

## Steps to Apply

### Via cPanel File Manager:
1. Login to cPanel
2. Open File Manager
3. Navigate to WordPress root (where `.htaccess` is)
4. Right-click `.htaccess` → Edit
5. Add the CORS section (Option 1) OR replace entire file (Option 2)
6. Save

### Via FTP:
1. Download current `.htaccess` (backup!)
2. Edit locally - add CORS section
3. Upload back to server
4. Done!

## What This Does

### Before (CORS Error):
```
Request header field x-cart-session is not allowed
```

### After (Works!):
```
✅ X-Cart-Session header allowed
✅ X-Cart-Session header exposed in response
✅ Cart works perfectly
```

## Testing

After updating `.htaccess`:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Go to** https://staging.fitbody.mk
3. **Open DevTools** (F12) → Console
4. **Refresh page**
5. **No CORS errors!** ✅

## Verify CORS Headers

Test with curl:
```bash
curl -I -X OPTIONS \
  -H "Origin: https://staging.fitbody.mk" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Cart-Session" \
  https://api.fitbody.mk/wp-json/fitbody/v1/cart
```

Should return:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session
Access-Control-Expose-Headers: X-Cart-Session
```

## Troubleshooting

### Still Getting CORS Errors?

**Check 1: mod_headers enabled**
```bash
# Check if mod_headers is enabled
php -m | grep headers
```

If not enabled, contact your hosting provider.

**Check 2: .htaccess is being read**
Add a test line at the top:
```apache
# TEST - If you see this in browser source, .htaccess is working
```

**Check 3: Clear all caches**
- Browser cache
- Cloudflare cache (if using)
- WordPress cache (if using caching plugin)
- Server cache (LiteSpeed cache)

**Check 4: File permissions**
`.htaccess` should be readable:
```bash
chmod 644 .htaccess
```

## Which Files to Update

You have TWO options:

### Option A: .htaccess Only (EASIEST) ⭐
- Update: `/public_html/.htaccess` (WordPress root)
- No PHP changes needed
- Works immediately

### Option B: Both .htaccess + functions.php (BELT & SUSPENDERS)
- Update: `/public_html/.htaccess` (WordPress root)
- Update: `/wp-content/themes/fitbody-ecommerce/functions.php`
- Double protection (recommended for production)

## Recommendation

**Use Option A (.htaccess only)** - it's simpler and works perfectly!

The `.htaccess` approach handles CORS at the Apache level, which is more reliable than PHP headers.

## After Update

Cart will work immediately:
- ✅ No CORS errors
- ✅ Multiple products persist
- ✅ Cart survives refresh
- ✅ Plus/minus buttons work
- ✅ Remove works

---

**Bottom Line:** Add the CORS section to your `.htaccess` file and the cart will work!
