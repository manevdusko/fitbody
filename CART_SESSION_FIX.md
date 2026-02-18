# Cart Session Token Fix

## Issue
Cart was not persisting multiple products - only the last added product remained.

## Root Cause
The frontend wasn't generating a session token on first request. When no token was sent to the backend, the backend would generate a NEW token for each request, creating a new cart session every time.

## Solution
Updated `src/utils/api.ts` to generate a session token on the frontend if none exists:

```typescript
// Generate session token if none exists (first time user)
if (!cartSession && typeof window !== 'undefined') {
  cartSession = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  Cookies.set('cart_session', cartSession, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
```

## How It Works Now

### First Request (New User)
1. Frontend checks for `cart_session` cookie
2. None found → Generate new token (timestamp + random string)
3. Store token in cookie
4. Send token in `X-Cart-Session` header to backend
5. Backend uses this token to identify cart in database
6. Backend returns same token in response header
7. Frontend confirms token matches

### Subsequent Requests
1. Frontend reads `cart_session` cookie
2. Sends token in `X-Cart-Session` header
3. Backend looks up cart by token in database
4. Returns all items for that session
5. Cart persists!

## Files Changed
- `src/utils/api.ts` - Added session token generation
- `wordpress-theme/functions.php` - Fixed syntax error (removed orphaned code)

## Testing
After deployment (in ~5 minutes):
1. Clear browser cookies
2. Add first product to cart
3. Add second product to cart
4. Both products should appear
5. Refresh page - both products should still be there
6. Check browser DevTools → Application → Cookies
7. Should see `cart_session` cookie with a value like `1708272000000-abc123xyz`

## Debugging
If cart still doesn't work:

**Check Browser Console:**
```
[Cart Session] Received from server: <token>
```

**Check Network Tab:**
- Request Headers should have: `X-Cart-Session: <token>`
- Response Headers should have: `X-Cart-Session: <token>`

**Check Cookies:**
- Should have `cart_session` cookie
- Value should be consistent across requests

**Check Backend (WordPress):**
```sql
SELECT * FROM wp_fitbody_cart;
```
- Should see rows with same `session_token` for multiple products

## Expected Behavior
✅ Multiple products persist in cart
✅ Cart survives page refresh
✅ Cart works across site navigation
✅ Same cart on all pages
✅ Session token consistent

## Deployment
- Committed: ✅
- Pushed: ✅
- GitHub Actions will deploy automatically
- Wait ~5 minutes for deployment
- Clear browser cache and test

## Next Steps
1. Wait for deployment to complete
2. Test cart functionality
3. If still not working, check browser console for errors
4. Verify `X-Cart-Session` header is being sent/received
