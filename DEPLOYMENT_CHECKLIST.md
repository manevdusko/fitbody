# Cart Fix Deployment Checklist

## Pre-Deployment

- [x] Custom cart system created (`custom-cart.php`)
- [x] All cart endpoints updated (`functions.php`)
- [x] Documentation created
- [ ] Files ready to upload

## Deployment Steps

### 1. Backup Current Files
- [ ] Download current `functions.php` from server (backup)
- [ ] Note: `custom-cart.php` is new, no backup needed

### 2. Upload Files to Server
Upload to: `/wp-content/themes/fitbody-ecommerce/`

- [ ] Upload `wordpress-theme/custom-cart.php`
- [ ] Upload `wordpress-theme/functions.php`

### 3. Create Database Table

Choose one method:

**Method A: Automatic (Recommended)**
- [ ] Go to WordPress Admin → Appearance → Themes
- [ ] Activate a different theme (any theme)
- [ ] Activate "FitBody" theme again
- [ ] Table created automatically

**Method B: Manual (phpMyAdmin)**
- [ ] Login to phpMyAdmin
- [ ] Select WordPress database
- [ ] Run SQL from `DEPLOY_CART_FIX.md`

### 4. Verify Database Table
- [ ] Run: `SHOW TABLES LIKE 'wp_fitbody_cart';`
- [ ] Confirm table exists

## Testing

### Basic Cart Operations
- [ ] Open https://staging.fitbody.mk
- [ ] Add first product to cart
- [ ] Add second product to cart
- [ ] Open cart - verify both products appear
- [ ] Refresh page - verify cart persists
- [ ] Update quantity of first product
- [ ] Remove second product
- [ ] Verify no errors in browser console

### Guest User
- [ ] Open site in incognito/private window
- [ ] Add products to cart
- [ ] Verify cart works without login

### Logged-In User
- [ ] Login to site
- [ ] Add products to cart
- [ ] Logout and login again
- [ ] Verify cart persists

### Dealer User (if applicable)
- [ ] Login as dealer
- [ ] Add product with dealer price
- [ ] Verify dealer price shows in cart

### Browser DevTools Check
- [ ] Open DevTools (F12) → Network tab
- [ ] Add product to cart
- [ ] Find cart API request
- [ ] Verify `X-Cart-Session` header in Request
- [ ] Verify `X-Cart-Session` header in Response

## Troubleshooting

### If Cart Not Working

**Check 1: Files Uploaded**
- [ ] Verify `custom-cart.php` exists on server
- [ ] Verify `functions.php` was updated
- [ ] Check file permissions (should be 644)

**Check 2: Database Table**
- [ ] Run: `SELECT * FROM wp_fitbody_cart;`
- [ ] Should return empty result (not error)

**Check 3: WordPress Errors**
- [ ] Check WordPress debug log
- [ ] Look for PHP errors
- [ ] Look for database errors

**Check 4: Browser Console**
- [ ] Open DevTools → Console
- [ ] Look for JavaScript errors
- [ ] Look for failed API requests

**Check 5: API Response**
- [ ] Open DevTools → Network
- [ ] Add product to cart
- [ ] Check response status (should be 200)
- [ ] Check response body (should have items array)

## Success Indicators

✅ Multiple products stay in cart
✅ Cart persists after refresh
✅ Delete works without errors
✅ No 500 errors in console
✅ `X-Cart-Session` header present
✅ Database table has rows when cart has items

## Rollback Plan (If Needed)

If something goes wrong:

1. **Restore functions.php**
   - Upload your backup of `functions.php`
   
2. **Remove custom-cart.php**
   - Delete `custom-cart.php` from server
   
3. **Drop database table** (optional)
   ```sql
   DROP TABLE IF EXISTS wp_fitbody_cart;
   ```

## Post-Deployment

### Monitor for 24 Hours
- [ ] Check error logs daily
- [ ] Monitor cart usage
- [ ] Watch for user reports

### Database Maintenance
- [ ] Old carts auto-delete after 7 days
- [ ] No manual cleanup needed
- [ ] Can view carts: `SELECT * FROM wp_fitbody_cart;`

### Performance Check
- [ ] Cart should load quickly
- [ ] No noticeable slowdown
- [ ] Database queries are indexed

## Documentation Reference

- **Detailed Implementation**: `CART_IMPLEMENTATION_COMPLETE.md`
- **Quick Deploy Guide**: `DEPLOY_CART_FIX.md`
- **Summary**: `CART_FIX_SUMMARY.md`
- **This Checklist**: `DEPLOYMENT_CHECKLIST.md`

## Support

If you encounter issues:

1. Check WordPress error log
2. Check browser console
3. Check database table
4. Review documentation files
5. Check `X-Cart-Session` headers

## Completion

- [ ] All deployment steps completed
- [ ] All tests passed
- [ ] No errors in logs
- [ ] Cart working as expected
- [ ] Documentation reviewed

**Deployment Date**: _____________

**Deployed By**: _____________

**Notes**: _____________________________________________
