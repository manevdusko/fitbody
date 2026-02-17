# WordPress API Setup for api.fitbody.mk

This document outlines the WordPress configuration needed on `api.fitbody.mk` to support the Next.js frontend.

## Required WordPress Plugins

1. **WooCommerce** - For product and e-commerce functionality
2. **JWT Authentication for WP REST API** - For secure user authentication
3. **Custom REST API endpoints** - See below for required endpoints

## Required REST API Endpoints

Your WordPress site needs these custom endpoints at `/wp-json/fitbody/v1/`:

### Products Endpoints

```
GET  /fitbody/v1/products
GET  /fitbody/v1/products/{id}
GET  /fitbody/v1/products/slug/{slug}
GET  /fitbody/v1/products/featured
GET  /fitbody/v1/products/categories
GET  /fitbody/v1/promotions
GET  /fitbody/v1/home/categories
```

### Cart Endpoints

```
GET    /fitbody/v1/cart
POST   /fitbody/v1/cart/add-item
POST   /fitbody/v1/cart/item
DELETE /fitbody/v1/cart/item/{key}
GET    /fitbody/v1/cart/shipping
```

### Auth Endpoints

```
POST /fitbody/v1/auth/login
POST /fitbody/v1/auth/logout
GET  /fitbody/v1/auth/me
```

### Order Endpoints

```
POST /fitbody/v1/orders
```

### Dealer Endpoints

```
POST /fitbody/v1/dealer/register
GET  /fitbody/v1/dealer/products
GET  /fitbody/v1/dealer/orders
PUT  /fitbody/v1/dealer/profile
```

## CORS Configuration

Add this to your WordPress theme's `functions.php` or create a custom plugin:

```php
<?php
/**
 * Plugin Name: FitBody API CORS
 * Description: Enable CORS for FitBody frontend
 * Version: 1.0.0
 */

// Enable CORS for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        // Allow your GitHub Pages domain
        $allowed_origins = [
            'https://yourusername.github.io',
            'http://localhost:3000', // For local development
        ];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
        
        return $value;
    });
}, 15);
```

## Custom Endpoints Implementation

Create a plugin file `fitbody-api-endpoints.php`:

```php
<?php
/**
 * Plugin Name: FitBody API Endpoints
 * Description: Custom REST API endpoints for FitBody frontend
 * Version: 1.0.0
 */

// Register custom REST API namespace
add_action('rest_api_init', function() {
    register_rest_route('fitbody/v1', '/products', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_products',
        'permission_callback' => '__return_true'
    ]);
    
    register_rest_route('fitbody/v1', '/products/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_product_by_id',
        'permission_callback' => '__return_true'
    ]);
    
    register_rest_route('fitbody/v1', '/products/slug/(?P<slug>[a-zA-Z0-9-]+)', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_product_by_slug',
        'permission_callback' => '__return_true'
    ]);
    
    // Add more endpoint registrations here...
});

// Example implementation
function fitbody_get_products($request) {
    $params = $request->get_params();
    $page = $params['page'] ?? 1;
    $per_page = $params['per_page'] ?? 12;
    $lang = $params['lang'] ?? 'en';
    
    $args = [
        'post_type' => 'product',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'post_status' => 'publish'
    ];
    
    // Add category filter if provided
    if (!empty($params['category'])) {
        $args['tax_query'] = [[
            'taxonomy' => 'product_cat',
            'field' => 'term_id',
            'terms' => $params['category']
        ]];
    }
    
    // Add search if provided
    if (!empty($params['search'])) {
        $args['s'] = $params['search'];
    }
    
    $query = new WP_Query($args);
    $products = [];
    
    foreach ($query->posts as $post) {
        $product = wc_get_product($post->ID);
        $products[] = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'image' => wp_get_attachment_url($product->get_image_id()),
            'gallery' => array_map('wp_get_attachment_url', $product->get_gallery_image_ids()),
            'categories' => wp_get_post_terms($product->get_id(), 'product_cat'),
            'in_stock' => $product->is_in_stock(),
            'stock_quantity' => $product->get_stock_quantity(),
        ];
    }
    
    return new WP_REST_Response([
        'products' => $products,
        'total' => $query->found_posts,
        'pages' => $query->max_num_pages
    ], 200);
}

// Implement other endpoint callbacks...
```

## Language Support

If you need multilingual support, install:
- **WPML** or **Polylang** for content translation
- Ensure the `lang` parameter is handled in your custom endpoints

## Security Considerations

1. **Authentication**: Use JWT tokens for authenticated requests
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **API Keys**: For sensitive operations, require API keys
4. **Input Validation**: Sanitize and validate all input parameters
5. **HTTPS**: Ensure api.fitbody.mk uses HTTPS

## Testing the API

Test your endpoints using curl:

```bash
# Test products endpoint
curl https://api.fitbody.mk/wp-json/fitbody/v1/products

# Test with parameters
curl "https://api.fitbody.mk/wp-json/fitbody/v1/products?page=1&per_page=12&lang=en"

# Test specific product
curl https://api.fitbody.mk/wp-json/fitbody/v1/products/123
```

## Monitoring

- Enable WordPress debug logging for API errors
- Monitor API response times
- Track failed requests
- Set up alerts for high error rates

## Performance Optimization

1. **Caching**: Use WordPress object caching (Redis/Memcached)
2. **CDN**: Serve images through a CDN
3. **Database**: Optimize database queries
4. **Pagination**: Always paginate large result sets
5. **Compression**: Enable gzip compression
