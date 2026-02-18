# Cart Fix - Quick Start

## 🚀 Deploy in 3 Steps

### Step 1: Upload Files (2 min)
Upload to `/wp-content/themes/fitbody-ecommerce/`:
- `wordpress-theme/custom-cart.php` (NEW)
- `wordpress-theme/functions.php` (UPDATED)

### Step 2: Create Table (1 min)
WordPress Admin → Appearance → Themes
- Activate any other theme
- Activate "FitBody" theme
- Done! (table created automatically)

### Step 3: Test (2 min)
Go to https://staging.fitbody.mk
- Add 2 products to cart
- Both should appear ✅
- Delete one product
- Should work without errors ✅

## ✅ What's Fixed

- Multiple products now persist in cart
- Delete works (no more 500 errors)
- Cart works across domains

## 📚 Documentation

- **Full Details**: `CART_IMPLEMENTATION_COMPLETE.md`
- **Deploy Guide**: `DEPLOY_CART_FIX.md`
- **Summary**: `CART_FIX_SUMMARY.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Status**: `STATUS_UPDATE.md`

## 🆘 Troubleshooting

**Cart not working?**
1. Check table exists: `SHOW TABLES LIKE 'wp_fitbody_cart';`
2. Check error log: `/wp-content/debug.log`
3. Check browser console (F12)

**Need to rollback?**
1. Restore old `functions.php`
2. Delete `custom-cart.php`
3. Done!

## 📊 Database

**View carts:**
```sql
SELECT * FROM wp_fitbody_cart;
```

**Clear old carts:**
```sql
DELETE FROM wp_fitbody_cart WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

## ✨ Features

- ✅ Cross-domain support
- ✅ Multiple products
- ✅ Dealer pricing
- ✅ Promotion pricing
- ✅ Auto cleanup (7 days)
- ✅ Guest & logged-in users

## 🎯 Success Indicators

After deployment:
- Multiple products stay in cart
- Cart persists after refresh
- Delete works without errors
- No 500 errors in console

---

**Ready to deploy!** Follow the 3 steps above.
