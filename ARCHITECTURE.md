# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         End Users                            │
│                    (Browsers/Devices)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    GitHub Pages CDN                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Static Next.js Application                  │    │
│  │                                                      │    │
│  │  • HTML/CSS/JavaScript                              │    │
│  │  • Optimized Images                                 │    │
│  │  • React Components                                 │    │
│  │  • Client-side Routing                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls
                         │ (CORS enabled)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  api.fitbody.mk                              │
│              WordPress + WooCommerce                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           WordPress REST API                        │    │
│  │                                                      │    │
│  │  • /wp-json/wp/v2/*        (WordPress Core)        │    │
│  │  • /wp-json/wc/v3/*        (WooCommerce)           │    │
│  │  • /wp-json/fitbody/v1/*   (Custom Endpoints)      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Database (MySQL)                       │    │
│  │                                                      │    │
│  │  • Products                                         │    │
│  │  • Orders                                           │    │
│  │  • Users                                            │    │
│  │  • Content                                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

```
┌─────────────────┐
│   Developer     │
│   Local Machine │
└────────┬────────┘
         │
         │ git push
         │
┌────────▼────────┐
│   GitHub Repo   │
│   (main branch) │
└────────┬────────┘
         │
         │ triggers
         │
┌────────▼────────────────────────────────────────┐
│         GitHub Actions Workflow                 │
│                                                  │
│  1. Checkout code                               │
│  2. Setup Node.js                               │
│  3. Install dependencies (npm ci)               │
│  4. Build Next.js (npm run build)               │
│  5. Upload artifacts                            │
│  6. Deploy to GitHub Pages                      │
└────────┬────────────────────────────────────────┘
         │
         │ deploys to
         │
┌────────▼────────┐
│  GitHub Pages   │
│  (Live Site)    │
└─────────────────┘
```

## Data Flow

### Product Browsing
```
User Browser
    │
    ├─→ Request: GET /products
    │
    ├─→ GitHub Pages serves static HTML/JS
    │
    └─→ JavaScript makes API call
         │
         └─→ api.fitbody.mk/wp-json/fitbody/v1/products
              │
              └─→ Returns JSON product data
                   │
                   └─→ React renders products
```

### Shopping Cart
```
User adds item to cart
    │
    ├─→ Client-side state update (React Context)
    │
    ├─→ API call: POST /cart/add-item
    │
    └─→ api.fitbody.mk processes request
         │
         ├─→ Updates cart in session/database
         │
         └─→ Returns updated cart data
              │
              └─→ React updates UI
```

### Checkout
```
User submits order
    │
    ├─→ API call: POST /orders
    │
    └─→ api.fitbody.mk/wp-json/fitbody/v1/orders
         │
         ├─→ Validates order data
         ├─→ Creates WooCommerce order
         ├─→ Processes payment (if applicable)
         ├─→ Sends confirmation email
         │
         └─→ Returns order confirmation
              │
              └─→ React shows success page
```

## Technology Stack

### Frontend (GitHub Pages)
```
┌─────────────────────────────────────┐
│         Next.js 14                  │
│  ┌───────────────────────────────┐ │
│  │  React 18                     │ │
│  │  ├─ TypeScript                │ │
│  │  ├─ Tailwind CSS              │ │
│  │  ├─ Framer Motion             │ │
│  │  └─ React Query               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Backend (api.fitbody.mk)
```
┌─────────────────────────────────────┐
│         WordPress                   │
│  ┌───────────────────────────────┐ │
│  │  WooCommerce                  │ │
│  │  ├─ Products                  │ │
│  │  ├─ Orders                    │ │
│  │  ├─ Cart                      │ │
│  │  └─ Payments                  │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  Custom REST API              │ │
│  │  ├─ /fitbody/v1/products      │ │
│  │  ├─ /fitbody/v1/cart          │ │
│  │  ├─ /fitbody/v1/orders        │ │
│  │  └─ /fitbody/v1/dealer        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Security Model

### Frontend Security
- ✅ Static files (no server-side vulnerabilities)
- ✅ HTTPS enforced by GitHub Pages
- ✅ No sensitive credentials in code
- ✅ Client-side validation
- ✅ XSS protection via React

### API Security
- ✅ CORS configured for allowed origins
- ✅ JWT authentication for user sessions
- ✅ HTTPS required
- ✅ Rate limiting (recommended)
- ✅ Input validation and sanitization
- ✅ WordPress security best practices

### Data Flow Security
```
Browser ←→ GitHub Pages (HTTPS)
   ↓
   └─→ api.fitbody.mk (HTTPS + CORS)
        ↓
        └─→ Database (Internal)
```

## Scalability

### Frontend Scaling
- ✅ CDN distribution via GitHub
- ✅ Static files (infinite scale)
- ✅ No server resources needed
- ✅ Automatic caching

### Backend Scaling
- WordPress caching (Redis/Memcached)
- Database optimization
- CDN for media files
- Load balancing (if needed)

## Performance Characteristics

### Frontend
- **First Load**: ~1-2s (static files from CDN)
- **Navigation**: <100ms (client-side routing)
- **API Calls**: Depends on WordPress response time

### Backend
- **API Response**: 100-500ms (typical)
- **Database Queries**: Optimized with caching
- **Image Delivery**: CDN recommended

## Monitoring Points

### Frontend
- GitHub Actions build status
- GitHub Pages uptime
- Client-side error tracking (optional)

### Backend
- WordPress uptime
- API response times
- Error logs
- Database performance

## Disaster Recovery

### Frontend
- Code in Git (version control)
- Automatic deployments from main branch
- Easy rollback via Git

### Backend
- WordPress database backups
- File system backups
- Plugin/theme backups

## Development Workflow

```
┌──────────────┐
│  Developer   │
└──────┬───────┘
       │
       ├─→ Edit code locally
       │
       ├─→ Test with npm run dev
       │   (connects to api.fitbody.mk)
       │
       ├─→ Commit changes
       │
       └─→ Push to GitHub
            │
            └─→ Automatic deployment
                 │
                 └─→ Live in minutes
```

## Cost Structure

### Frontend (GitHub Pages)
- **Cost**: FREE
- **Bandwidth**: 100GB/month
- **Build Minutes**: 2,000/month (free tier)

### Backend (WordPress Hosting)
- **Cost**: Depends on hosting provider
- **Requirements**: 
  - PHP 7.4+
  - MySQL 5.7+
  - HTTPS
  - Adequate bandwidth for API calls

## Advantages of This Architecture

1. **Separation of Concerns**
   - Frontend and backend are independent
   - Can update either without affecting the other

2. **Cost Effective**
   - Free frontend hosting
   - Only pay for WordPress hosting

3. **Performance**
   - Static frontend (fast)
   - CDN distribution
   - Optimized builds

4. **Developer Experience**
   - Modern React development
   - Hot reload in development
   - TypeScript support

5. **Scalability**
   - Frontend scales infinitely
   - Backend can be optimized independently

6. **Reliability**
   - GitHub Pages uptime: 99.9%+
   - Frontend works even if WordPress is slow
   - Graceful degradation possible

## Limitations

1. **No Server-Side Rendering**
   - All rendering happens client-side
   - SEO depends on client-side rendering

2. **API Dependency**
   - Frontend requires WordPress API to be available
   - CORS must be properly configured

3. **Build Time**
   - Changes require rebuild and deployment
   - Not instant like server-side updates

## Future Enhancements

- [ ] Add Redis caching to WordPress
- [ ] Implement CDN for WordPress media
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Implement service worker for offline support
- [ ] Add automated testing in CI/CD
- [ ] Set up staging environment

---

For implementation details, see:
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [WORDPRESS_API_SETUP.md](WORDPRESS_API_SETUP.md)
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
