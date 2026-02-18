# Fix Cart in 3 Simple Steps

## The Problem
CORS error blocking cart from working:
```
Request header field x-cart-session is not allowed
```

## The Solution
Add CORS headers to `.htaccess` file

---

## Step 1: Open .htaccess File

**Location:** WordPress root folder (where you see `wp-config.php`)

**Via cPanel:**
1. Login to cPanel
2. Click "File Manager"
3. Find `.htaccess` file
4. Right-click → Edit

**Via FTP:**
1. Connect to server
2. Navigate to WordPress root
3. Download `.htaccess` (backup!)
4. Open in text editor

---

## Step 2: Add CORS Headers

Find this line in your `.htaccess`:
```apache
# END WordPress
```

**Right after that line**, add this:

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

---

## Step 3: Save and Test

1. **Save** the `.htaccess` file
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Go to** https://staging.fitbody.mk
4. **Test cart:**
   - Add first product
   - Add second product
   - Both should appear! ✅

---

## Visual Guide

Your `.htaccess` should look like this:

```apache
# BEGIN WordPress
...existing WordPress rules...
# END WordPress

# CORS Headers for API requests    <-- ADD THIS SECTION
<IfModule mod_headers.c>
    ...CORS headers here...
</IfModule>

# Cache static assets                <-- Your existing cache section
<IfModule mod_expires.c>
...
```

---

## That's It!

Once you save the `.htaccess` file, the cart will work immediately.

No need to:
- ❌ Upload functions.php
- ❌ Upload custom-cart.php  
- ❌ Restart server
- ❌ Wait for deployment

Just:
- ✅ Edit `.htaccess`
- ✅ Save
- ✅ Test

---

## Need Help?

If you're not comfortable editing `.htaccess`, I can provide the complete file content and you can just copy/paste the entire thing.

The complete file is in: `wordpress-integration/.htaccess`
