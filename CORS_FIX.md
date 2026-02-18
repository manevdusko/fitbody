# CORS Fix for X-Cart-Session Header

## Issue
```
Access to XMLHttpRequest at 'https://api.fitbody.mk/...' from origin 'https://staging.fitbody.mk' 
has been blocked by CORS policy: Request header field x-cart-session is not allowed by 
Access-Control-Allow-Headers in preflight response.
```

## Root Cause
The WordPress backend CORS configuration didn't include `X-Cart-Session` in the allowed headers list.

## Solution
Updated `wordpress-theme/functions.php` to:
1. Allow `X-Cart-Session` in request headers (`Access-Control-Allow-Headers`)
2. Expose `X-Cart-Session` in response headers (`Access-Control-Expose-Headers`)

## Changes Made

### Before:
```php
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
```

### After:
```php
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session');
header('Access-Control-Expose-Headers: X-Cart-Session');
```

## Files Modified
- `wordpress-theme/functions.php` - Updated 2 CORS functions:
  - `fitbody_add_cors_headers()` - Main CORS handler
  - `fitbody_jwt_auth_cors()` - JWT authentication CORS handler

## Deployment Steps

### CRITICAL: Upload to WordPress Server
The frontend changes are already deployed via GitHub Pages, but the backend changes need to be uploaded manually:

1. **Upload File:**
   - File: `wordpress-theme/functions.php`
   - Destination: `/wp-content/themes/fitbody-ecommerce/functions.php`
   - Server: `api.fitbody.mk`

2. **Verify Upload:**
   - Check file was uploaded successfully
   - Check file permissions (should be 644)

3. **Test CORS:**
   - Open https://staging.fitbody.mk
   - Open browser DevTools → Network tab
   - Refresh page
   - Look for API requests to api.fitbody.mk
   - Check Response Headers - should include:
     - `Access-Control-Allow-Headers: ..., X-Cart-Session`
     - `Access-Control-Expose-Headers: X-Cart-Session`

## Testing

### 1. Check CORS Headers
Open browser DevTools → Network tab:

**Request Headers (should include):**
```
X-Cart-Session: <token>
```

**Response Headers (should include):**
```
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session
Access-Control-Expose-Headers: X-Cart-Session
X-Cart-Session: <token>
```

### 2. Test Cart Functionality
1. Clear browser cache and cookies
2. Add first product to cart
3. Add second product to cart
4. Both products should appear
5. No CORS errors in console

## Expected Behavior After Fix

✅ No CORS errors in console
✅ API requests succeed
✅ Cart session token sent and received
✅ Multiple products persist in cart
✅ Cart works across page navigation

## Troubleshooting

### Still Getting CORS Errors?

**Check 1: File Uploaded**
- Verify `functions.php` was uploaded to correct location
- Check file modification date

**Check 2: WordPress Cache**
- Clear WordPress cache (if using caching plugin)
- Clear Cloudflare cache (if using Cloudflare)

**Check 3: Server Configuration**
- Some servers override PHP headers
- Check `.htaccess` file
- Check server-level CORS configuration

**Check 4: Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache completely

### Verify CORS Headers via cURL

Test from command line:
```bash
curl -I -X OPTIONS \
  -H "Origin: https://staging.fitbody.mk" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Cart-Session" \
  https://api.fitbody.mk/wp-json/fitbody/v1/cart
```

Should return:
```
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session
Access-Control-Expose-Headers: X-Cart-Session
```

## Summary

The cart system is now complete:
1. ✅ Frontend generates session token
2. ✅ Frontend sends token in X-Cart-Session header
3. ✅ Backend allows X-Cart-Session header (CORS)
4. ✅ Backend stores cart in database by session token
5. ✅ Backend returns session token in response
6. ✅ Frontend reads and stores session token

Once you upload the updated `functions.php` file, the cart should work perfectly!
