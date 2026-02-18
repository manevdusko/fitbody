# Custom Cart Implementation - Complete

## What Was Done

### 1. Created Custom Database-Based Cart System
**File**: `wordpress-theme/custom-cart.php`

This new file implements a complete cart system that doesn't rely on WooCommerce sessions or cookies:

- **Database Table**: `wp_fitbody_cart` stores cart items with session tokens
- **Session Management**: Uses `X-Cart-Session` header to identify carts across domains
- **CRUD Operations**: Full create, read, update, delete functionality
- **User Support**: Works for both guest users (session token) and logged-in users (user ID)
- **Dealer Pricing**: Automatically applies dealer prices for approved dealers
- **Promotion Pricing**: Applies active promotion prices
- **Auto Cleanup**: Removes carts older than 7 days automatically

### 2. Updated All Cart Endpoints
**File**: `wordpress-theme/functions.php`

All four cart endpoints now use the custom cart system:

#### `GET /wp-json/fitbody/v1/cart`
- Gets cart items from database using session token
- Returns formatted cart with items and totals
- Sends `X-Cart-Session` header in response

#### `POST /wp-json/fitbody/v1/cart/add-item`
- Adds product to database cart
- Validates product exists
- Handles variations for variable products
- Updates quantity if item already exists
- Returns updated cart with new session token

#### `POST /wp-json/fitbody/v1/cart/item`
- Updates cart item quantity in database
- Removes item if quantity is 0
- Returns updated cart

#### `DELETE /wp-json/fitbody/v1/cart/item/{key}`
- Removes item from database cart
- Returns updated cart

### 3. Key Features

**Cross-Domain Support**
- Cart persists across `staging.fitbody.mk` and `api.fitbody.mk`
- Uses `X-Cart-Session` header instead of cookies
- Frontend sends session token with every request
- Backend returns session token in response headers

**Multiple Products**
- Cart now properly stores multiple products
- Each product is a separate database row
- No more "only last product remains" issue

**Dealer Pricing**
- Automatically detects if user is approved dealer
- Applies dealer prices from `_dealer_price` meta field
- Falls back to regular price if no dealer price set

**Promotion Pricing**
- Checks if promotion is currently active (date range)
- Applies promotion price if active
- Shows promotion label

**Data Integrity**
- Validates products exist before adding
- Removes invalid products from cart
- Handles product variations correctly
- Stores variation data as JSON

## Files Modified

1. `wordpress-theme/custom-cart.php` - NEW FILE (complete cart system)
2. `wordpress-theme/functions.php` - Updated all 4 cart endpoints

## Deployment Steps

### 1. Upload Files to WordPress Server
Upload these two files to your WordPress installation at `api.fitbody.mk`:

```bash
# Upload to: /wp-content/themes/fitbody-ecommerce/
- custom-cart.php
- functions.php
```

### 2. Create Database Table
The table will be created automatically when you activate the theme. To manually trigger it:

**Option A**: Deactivate and reactivate the theme in WordPress admin
- Go to Appearance > Themes
- Activate a different theme
- Activate FitBody theme again

**Option B**: Run this SQL directly in phpMyAdmin:
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
    PRIMARY KEY  (id),
    KEY session_token (session_token),
    KEY user_id (user_id),
    KEY product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Verify Table Creation
Check that the table was created:
```sql
SHOW TABLES LIKE 'wp_fitbody_cart';
```

## Testing Checklist

Once deployed, test these scenarios:

### Basic Cart Operations
- [ ] Add a product to cart
- [ ] Add a second product to cart
- [ ] Verify both products appear in cart
- [ ] Refresh the page - cart should persist
- [ ] Navigate to different pages - cart should persist
- [ ] Update product quantity
- [ ] Remove a product from cart
- [ ] Add same product twice - quantity should increase

### Guest User Cart
- [ ] Open site in incognito/private window
- [ ] Add products to cart
- [ ] Cart should work without login
- [ ] Session token should be in browser storage

### Logged-In User Cart
- [ ] Login as regular user
- [ ] Add products to cart
- [ ] Cart should persist after logout/login
- [ ] Cart should be tied to user ID

### Dealer Pricing
- [ ] Login as approved dealer
- [ ] Add product with dealer price to cart
- [ ] Verify dealer price is shown (not regular price)
- [ ] Verify total uses dealer price

### Promotion Pricing
- [ ] Add product with active promotion to cart
- [ ] Verify promotion price is shown
- [ ] Verify promotion label appears

### Variable Products
- [ ] Add variable product (with size/color options)
- [ ] Select a variation
- [ ] Add to cart
- [ ] Verify variation details are stored
- [ ] Add different variation of same product
- [ ] Both variations should be separate cart items

### Edge Cases
- [ ] Try to add invalid product ID
- [ ] Try to add out-of-stock product
- [ ] Try to update quantity to negative number
- [ ] Try to remove non-existent cart item
- [ ] Clear browser storage and verify new session is created

## Troubleshooting

### Cart Not Persisting
**Check**: Is `X-Cart-Session` header being sent?
- Open browser DevTools > Network tab
- Look for cart API requests
- Check Request Headers for `X-Cart-Session`
- Check Response Headers for `X-Cart-Session`

**Fix**: Frontend should store session token and send it with every request

### Products Not Appearing
**Check**: Database table and error logs
```sql
SELECT * FROM wp_fitbody_cart ORDER BY created_at DESC LIMIT 10;
```

**Check WordPress error log**:
```bash
tail -f /path/to/wordpress/wp-content/debug.log
```

### Delete Not Working
**Check**: Is correct cart item ID being sent?
- The `key` parameter should be the database row ID (integer)
- Not the WooCommerce cart key (hash string)

### Dealer Prices Not Applying
**Check**: User meta fields
```sql
SELECT user_id, meta_key, meta_value 
FROM wp_usermeta 
WHERE meta_key IN ('is_dealer', 'dealer_status');
```

User must have:
- `is_dealer` = '1'
- `dealer_status` = 'approved'

## Database Maintenance

### View All Active Carts
```sql
SELECT 
    c.*,
    p.post_title as product_name,
    u.user_login
FROM wp_fitbody_cart c
LEFT JOIN wp_posts p ON c.product_id = p.ID
LEFT JOIN wp_users u ON c.user_id = u.ID
ORDER BY c.updated_at DESC;
```

### Clear Old Carts (Manual)
```sql
DELETE FROM wp_fitbody_cart 
WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Clear Specific User's Cart
```sql
DELETE FROM wp_fitbody_cart WHERE user_id = 123;
```

### Clear Specific Session's Cart
```sql
DELETE FROM wp_fitbody_cart WHERE session_token = 'abc-123-xyz';
```

## Frontend Integration

The frontend (`src/utils/api.ts`) already has the `X-Cart-Session` header handling implemented:

```typescript
// Session token is stored in localStorage
// Sent with every cart request
// Updated from response headers
```

No frontend changes needed - it's already configured correctly.

## Next Steps

1. Upload the two files to WordPress server
2. Verify database table is created
3. Test all cart operations
4. Monitor error logs for any issues
5. If everything works, consider removing old WooCommerce session code

## Benefits of This Approach

✅ **Cross-Domain**: Works across different domains without cookie issues
✅ **Persistent**: Cart survives page refreshes and navigation
✅ **Multiple Products**: No more "only last product" bug
✅ **Scalable**: Database-backed, can handle many items
✅ **Flexible**: Easy to add features (wishlists, saved carts, etc.)
✅ **Secure**: Session tokens are UUIDs, hard to guess
✅ **Clean**: Automatic cleanup of old carts
✅ **Compatible**: Still uses WooCommerce products, just custom cart storage

## Migration Notes

This implementation completely bypasses WooCommerce's cart system for storage, but still uses WooCommerce for:
- Product data and validation
- Checkout and order creation
- Payment processing
- Inventory management

The cart is just stored differently - in a custom table instead of WooCommerce sessions.
