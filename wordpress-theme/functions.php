<?php
/**
 * FitBody.mk Theme Functions
 */
if (!defined('ABSPATH')) {
    exit;
}

// Suppress WooCommerce translation warning by ensuring proper load order
add_action('plugins_loaded', function() {
    // Ensure WooCommerce is loaded before we use it
    if (class_exists('WooCommerce')) {
        // WooCommerce is ready
    }
}, 5);

// Ensure theme support is properly declared
add_action('after_setup_theme', function() {
    // Add theme support for required WordPress features
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    
    // Ensure WordPress recognizes this as a valid theme
    if (!current_theme_supports('menus')) {
        add_theme_support('menus');
    }
});

// Load diagnostic page
require_once get_template_directory() . '/diagnostic.php';

/**
 * Prevent WordPress from overwriting custom .htaccess rules
 * This ensures our CORS and custom configurations persist
 */
add_filter('flush_rewrite_rules_hard', function($hard) {
    // Return false to prevent .htaccess from being overwritten
    // Rewrite rules will still be flushed in the database
    return false;
});

/**
 * Preserve custom .htaccess content when WordPress tries to update it
 */
add_filter('mod_rewrite_rules', function($rules) {
    // Add our custom CORS headers before WordPress rules
    $custom_rules = "# CORS Headers for API requests\n";
    $custom_rules .= "<IfModule mod_headers.c>\n";
    $custom_rules .= "    Header always set Access-Control-Allow-Origin \"*\"\n";
    $custom_rules .= "    Header always set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\"\n";
    $custom_rules .= "    Header always set Access-Control-Allow-Headers \"Authorization, Content-Type, X-Requested-With, X-Cart-Session\"\n";
    $custom_rules .= "    Header always set Access-Control-Expose-Headers \"X-Cart-Session, X-WP-Total, X-WP-TotalPages\"\n";
    $custom_rules .= "    Header always set Access-Control-Allow-Credentials \"true\"\n";
    $custom_rules .= "</IfModule>\n\n";
    
    $custom_rules .= "# Handle preflight OPTIONS requests\n";
    $custom_rules .= "<IfModule mod_rewrite.c>\n";
    $custom_rules .= "    RewriteCond %{REQUEST_METHOD} OPTIONS\n";
    $custom_rules .= "    RewriteRule ^(.*)$ $1 [R=200,L]\n";
    $custom_rules .= "</IfModule>\n\n";
    
    return $custom_rules . $rules;
});

/**
 * Theme setup with SEO support
 */
function fitbody_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    
    // Add custom image sizes for SEO
    add_image_size('og-image', 1200, 630, true); // Open Graph
    add_image_size('twitter-card', 1200, 600, true); // Twitter Card
    add_image_size('product-schema', 800, 800, true); // Product Schema
}
add_action('after_setup_theme', 'fitbody_theme_setup');

// ============================================================================
// REDIRECT API DOMAIN TO MAIN SITE (EXCEPT ADMIN & API)
// ============================================================================

add_action('template_redirect', function() {
    // Only redirect if on api.fitbody.mk
    if ($_SERVER['HTTP_HOST'] !== 'api.fitbody.mk') {
        return;
    }
    
    // Don't redirect admin panel
    if (is_admin()) {
        return;
    }
    
    // Don't redirect REST API requests
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }
    
    // Don't redirect wp-admin, wp-login, wp-json
    $request_uri = $_SERVER['REQUEST_URI'];
    if (strpos($request_uri, '/wp-admin') === 0 || 
        strpos($request_uri, '/wp-login') === 0 || 
        strpos($request_uri, '/wp-json') === 0) {
        return;
    }
    
    // Redirect everything else to fitbody.mk
    $redirect_url = 'https://fitbody.mk' . $request_uri;
    wp_redirect($redirect_url, 301);
    exit;
}, 1);

/**
 * SEO meta tags for WordPress pages
 */
function fitbody_add_seo_meta_tags() {
    if (is_admin()) return;
    
    global $post;
    $site_name = 'FitBody.mk';
    $site_description = 'Најголема онлајн продавница за суплементи во Македонија';
    $site_url = home_url();
    
    // Default meta tags
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">' . "\n";
    echo '<meta name="robots" content="index, follow">' . "\n";
    echo '<meta name="author" content="FitBody.mk">' . "\n";
    echo '<meta name="language" content="Macedonian">' . "\n";
    echo '<meta name="revisit-after" content="7 days">' . "\n";
    echo '<meta name="distribution" content="web">' . "\n";
    echo '<meta name="rating" content="general">' . "\n";
    
    // Open Graph meta tags
    echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";
    echo '<meta property="og:locale" content="mk_MK">' . "\n";
    echo '<meta property="og:locale:alternate" content="en_US">' . "\n";
    
    // Twitter Card meta tags
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:site" content="@goldtouchnutrition.mk">' . "\n";
    echo '<meta name="twitter:creator" content="@goldtouchnutrition.mk">' . "\n";
    
    // Page-specific meta tags
    if (is_home() || is_front_page()) {
        $title = $site_name . ' - Суплементи и Спортска Исхрана #1 во Македонија';
        $description = 'Најголема онлајн продавница за суплементи во Македонија. Протеини, креатин, витамини, пре-воркаут. ✓ Оригинални производи ✓ Брза достава ✓ Најдобри цени';
        $keywords = 'суплементи македонија, протеини македонија, креатин македонија, витамини македонија, спортска исхрана, фитнес суплементи, бодибилдинг, whey протеин, масс гејнер';
        $og_image = $site_url . '/wp-content/themes/fitbody-ecommerce/images/og-home.jpg';
        
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta name="keywords" content="' . esc_attr($keywords) . '">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($site_url) . '">' . "\n";
        echo '<meta property="og:image" content="' . esc_url($og_image) . '">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta name="twitter:image" content="' . esc_url($og_image) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($site_url) . '">' . "\n";
    }
    
    // Additional performance and SEO headers
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link rel="dns-prefetch" href="//fonts.googleapis.com">' . "\n";
    echo '<link rel="dns-prefetch" href="//fonts.gstatic.com">' . "\n";
}
add_action('wp_head', 'fitbody_add_seo_meta_tags', 1);

/**
 * Add structured data for organization
 */
function fitbody_add_organization_schema() {
    if (is_admin()) return;
    
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'FitBody.mk',
        'description' => 'Водечки дистрибутер на суплементи и спортска исхрана во Македонија од 1991 година',
        'url' => home_url(),
        'logo' => home_url('/wp-content/themes/fitbody-ecommerce/images/logo.png'),
        'contactPoint' => [
            '@type' => 'ContactPoint',
            'telephone' => '+389-75-555-511',
            'contactType' => 'customer service',
            'email' => 'fitbody.mk@icloud.com'
        ],
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => 'Ул. Гоце Делчев бр.85',
            'addressLocality' => 'Кочани',
            'addressRegion' => 'Источен регион',
            'postalCode' => '2300',
            'addressCountry' => 'MK'
        ],
        'sameAs' => [
            'https://www.facebook.com/fitbody.mk',
            'https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng=='
        ],
        'foundingDate' => '1991-01-01'
    ];
    
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
}
add_action('wp_head', 'fitbody_add_organization_schema', 5);

/**
 * Add local business schema
 */
function fitbody_add_local_business_schema() {
    if (is_admin()) return;
    
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'LocalBusiness',
        'name' => 'FitBody.mk',
        'description' => 'Продавница за суплементи и спортска исхрана во Кочани, Македонија',
        'url' => home_url(),
        'telephone' => '+389-75-555-511',
        'email' => 'fitbody.mk@icloud.com',
        'address' => [
            '@type' => 'PostalAddress',
            'streetAddress' => 'Ул. Гоце Делчев бр.85',
            'addressLocality' => 'Кочани',
            'addressRegion' => 'Источен регион',
            'postalCode' => '2300',
            'addressCountry' => 'MK'
        ],
        'geo' => [
            '@type' => 'GeoCoordinates',
            'latitude' => 41.9214,
            'longitude' => 22.4144
        ],
        'openingHoursSpecification' => [
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'opens' => '08:00',
                'closes' => '17:00'
            ],
            [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => 'Saturday',
                'opens' => '08:00',
                'closes' => '14:00'
            ]
        ],
        'priceRange' => '$$',
        'currenciesAccepted' => 'MKD',
        'paymentAccepted' => 'Cash, Credit Card, Bank Transfer',
        'areaServed' => [
            '@type' => 'Country',
            'name' => 'Macedonia'
        ]
    ];
    
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
}
add_action('wp_head', 'fitbody_add_local_business_schema', 6);

/**
 * Minimal frontend assets.
 * WordPress only serves API endpoints - no frontend assets needed.
 */
function fitbody_enqueue_assets() {
    if (is_admin()) {
        return;
    }

    $override = get_template_directory() . '/wp-overrides.css';
    if (file_exists($override)) {
        wp_enqueue_style(
            'fitbody-wp-overrides',
            get_template_directory_uri() . '/wp-overrides.css',
            [],
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'fitbody_enqueue_assets');

/**
 * CORS Headers for API requests
 */
function fitbody_add_cors_headers() {
    // Only set headers if no output has been sent yet
    if (headers_sent()) {
        return;
    }
    
    // Allow requests from your Next.js domain
    $allowed_origins = [
        'https://fitbody.mk',
        'http://localhost:3000',
        'http://localhost:3001'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback for API requests
        header('Access-Control-Allow-Origin: *');
    }
    
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session');
    header('Access-Control-Allow-Credentials: true');
    // IMPORTANT: Expose pagination headers so JavaScript can read them
    header('Access-Control-Expose-Headers: X-Cart-Session, X-WP-Total, X-WP-TotalPages');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
// Use earlier hook to prevent header warnings
add_action('send_headers', 'fitbody_add_cors_headers');

/**
 * JWT Authentication Support
 * Requires JWT Authentication for WP REST API plugin
 */
function fitbody_jwt_auth_cors() {
    // Only set headers if no output has been sent yet
    if (!headers_sent()) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-Cart-Session');
        header('Access-Control-Expose-Headers: X-Cart-Session');
    }
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        exit(0);
    }
}
// Use earlier hook to set headers before any output
add_action('send_headers', 'fitbody_jwt_auth_cors');

/**
 * JWT Auth Secret Key Filter
 */
function fitbody_jwt_auth_secret_key($key) {
    return defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : 'your-secret-key-here';
}
add_filter('jwt_auth_secret_key', 'fitbody_jwt_auth_secret_key');

/**
 * FitBody E-commerce Theme Functions
 * 
 * Custom WordPress theme for FitBody.mk e-commerce platform
 */

// Include custom cart system
require_once get_template_directory() . '/custom-cart.php';

/**
 * Initialize WooCommerce for REST API requests
 */
function fitbody_init_woocommerce_for_api() {
    if (!function_exists('WC')) {
        return;
    }
    
    // Get or create session token from request header
    $session_token = null;
    $headers = getallheaders();
    
    if (isset($headers['X-Cart-Session'])) {
        $session_token = $headers['X-Cart-Session'];
    } elseif (isset($_SERVER['HTTP_X_CART_SESSION'])) {
        $session_token = $_SERVER['HTTP_X_CART_SESSION'];
    }
    
    // Generate new token if none exists
    if (!$session_token) {
        $session_token = wp_generate_uuid4();
    }
    
    error_log('Cart session token: ' . $session_token);
    
    // Initialize WooCommerce session with custom handler
    if (!WC()->session || !WC()->session->has_session()) {
        WC()->session = new WC_Session_Handler();
        WC()->session->init();
        
        // Set custom session key based on our token
        WC()->session->set_customer_session_cookie(true);
        $_COOKIE['wp_woocommerce_session_' . COOKIEHASH] = $session_token;
    }
    
    // Initialize customer before cart
    if (!WC()->customer) {
        WC()->customer = new WC_Customer();
    }
    
    // Initialize cart
    if (!WC()->cart) {
        WC()->cart = new WC_Cart();
        // Load cart from session after initializing
        WC()->cart->get_cart_from_session();
    }
    
    error_log('Cart initialized - Items count: ' . WC()->cart->get_cart_contents_count());
    error_log('Cart contents: ' . print_r(array_keys(WC()->cart->get_cart()), true));
    
    // Store session token for response
    if (!defined('FITBODY_CART_SESSION')) {
        define('FITBODY_CART_SESSION', $session_token);
    }
}

/**
 * Add cart session token to response headers
 */
function fitbody_add_cart_session_header($response) {
    if (defined('FITBODY_CART_SESSION')) {
        $response->header('X-Cart-Session', FITBODY_CART_SESSION);
    }
    return $response;
}

/**
 * Get or create a cart session ID for API requests
 */
function fitbody_get_cart_session_id() {
    // Try to get session ID from cookie
    $session_id = isset($_COOKIE['fitbody_cart_session']) ? $_COOKIE['fitbody_cart_session'] : null;
    
    if (!$session_id) {
        // Generate a new session ID
        $session_id = wp_generate_uuid4();
        
        // Set cookie for 24 hours
        setcookie('fitbody_cart_session', $session_id, time() + (24 * 60 * 60), '/');
    }
    
    return $session_id;
}

/**
 * Save cart data to transient
 */
function fitbody_save_cart_to_transient($cart_data) {
    $session_id = fitbody_get_cart_session_id();
    set_transient('fitbody_cart_' . $session_id, $cart_data, 24 * 60 * 60); // 24 hours
}

/**
 * Load cart data from transient
 */
function fitbody_load_cart_from_transient() {
    $session_id = fitbody_get_cart_session_id();
    return get_transient('fitbody_cart_' . $session_id);
}

/**
 * WooCommerce API Proxy Endpoints
 * This allows secure access to WooCommerce API without exposing credentials in client code
 */
function fitbody_register_woocommerce_proxy() {
    // Health check endpoint to verify API is working
    register_rest_route('fitbody/v1', '/health', [
        'methods'  => 'GET',
        'callback' => function() {
            return rest_ensure_response([
                'status' => 'ok',
                'message' => 'FitBody API is working',
                'timestamp' => current_time('mysql'),
                'domain' => home_url(),
                'rest_url' => rest_url(),
                'theme_active' => wp_get_theme()->get('Name'),
                'woocommerce_active' => function_exists('WC') ? 'yes' : 'no',
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // Categories endpoint (no multilingual version, keep original)
    register_rest_route('fitbody/v1', '/products/categories', [
        'methods'  => 'GET',
        'callback' => 'fitbody_proxy_woocommerce_categories',
        'permission_callback' => '__return_true',
    ]);

    // Promotions endpoint
    register_rest_route('fitbody/v1', '/promotions', [
        'methods'  => 'GET',
        'callback' => 'fitbody_get_promotions',
        'permission_callback' => '__return_true',
    ]);

    // Home page categories endpoint
    register_rest_route('fitbody/v1', '/home/categories', [
        'methods'  => 'GET',
        'callback' => 'fitbody_get_home_categories',
        'permission_callback' => '__return_true',
    ]);

    // Cart endpoints
    register_rest_route('fitbody/v1', '/cart', [
        'methods'  => 'GET',
        'callback' => 'fitbody_proxy_get_cart',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('fitbody/v1', '/cart/add-item', [
        'methods'  => 'POST',
        'callback' => 'fitbody_proxy_add_to_cart',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('fitbody/v1', '/cart/item', [
        'methods'  => 'POST',
        'callback' => 'fitbody_proxy_update_cart_item',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('fitbody/v1', '/cart/item/(?P<key>[a-zA-Z0-9_-]+)', [
        'methods'  => 'DELETE',
        'callback' => 'fitbody_proxy_remove_cart_item',
        'permission_callback' => '__return_true',
    ]);

    // Order endpoints
    register_rest_route('fitbody/v1', '/orders', [
        'methods'  => 'POST',
        'callback' => 'fitbody_create_order',
        'permission_callback' => '__return_true',
    ]);

    // Debug endpoint to check cart status
    register_rest_route('fitbody/v1', '/debug/cart', [
        'methods'  => 'GET',
        'callback' => 'fitbody_debug_cart',
        'permission_callback' => '__return_true',
    ]);
    
    // Debug endpoint to test category filtering
    register_rest_route('fitbody/v1', '/debug/categories', [
        'methods'  => 'GET',
        'callback' => 'fitbody_debug_categories',
        'permission_callback' => '__return_true',
    ]);

    // Featured products endpoint
    register_rest_route('fitbody/v1', '/products/featured', [
        'methods'  => 'GET',
        'callback' => 'fitbody_get_featured_products',
        'permission_callback' => '__return_true',
    ]);
    
    // Contact form endpoint
    register_rest_route('fitbody/v1', '/contact', [
        'methods'  => 'POST',
        'callback' => 'fitbody_handle_contact_form',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_woocommerce_proxy');

/**
 * Authenticate user for REST API requests - called early
 */
function fitbody_authenticate_rest_user() {
    // Skip if user is already authenticated
    if (is_user_logged_in()) {
        return;
    }
    
    // Check for session token
    $session_token = null;
    
    // Try to get from cookie first
    if (isset($_COOKIE['fitbody_session'])) {
        $session_token = $_COOKIE['fitbody_session'];
    }
    
    // Try to get from Authorization header
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            $session_token = substr($auth_header, 7);
        }
    }
    
    if ($session_token) {
        $user_id = get_transient('fitbody_session_' . $session_token);
        if ($user_id) {
            $user = get_user_by('ID', $user_id);
            if ($user) {
                wp_set_current_user($user->ID);
                wp_set_auth_cookie($user->ID, true);
                error_log('Authenticated user via session token: ' . $user->ID);
            }
        }
    }
}

// Call authentication early - before REST API init
add_action('plugins_loaded', 'fitbody_authenticate_rest_user', 1);

// Also call on REST API init
add_action('rest_api_init', 'fitbody_authenticate_rest_user', 1);

/**
 * Initialize WooCommerce for API requests and handle authentication
 */
function fitbody_init_wc_for_rest_api() {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        // Ensure authentication is called again for REST requests
        fitbody_authenticate_rest_user();
        
        // Initialize WooCommerce for REST API requests
        fitbody_init_woocommerce_for_api();
    }
}
// Use wp_loaded instead of init to ensure WooCommerce translations are loaded first
add_action('wp_loaded', 'fitbody_init_wc_for_rest_api');

/**
 * Proxy WooCommerce products API
 */
function fitbody_proxy_woocommerce_products($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Get parameters from request
    $page = $request->get_param('page') ?: 1;
    $per_page = $request->get_param('per_page') ?: 12;
    $search = $request->get_param('search');
    $category = $request->get_param('category');
    $min_price = $request->get_param('min_price');
    $max_price = $request->get_param('max_price');
    $language = $request->get_param('lang') ?: 'mk';

    // Debug logging
    error_log('Products API called with params: ' . print_r([
        'page' => $page,
        'per_page' => $per_page,
        'search' => $search,
        'category' => $category,
        'min_price' => $min_price,
        'max_price' => $max_price,
        'language' => $language,
    ], true));

    // Build query args
    $args = [
        'status' => 'publish',
        'limit' => $per_page,
        'offset' => ($page - 1) * $per_page,
    ];

    if ($search) {
        $args['s'] = $search;
    }

    if ($category) {
        // Convert category parameter to proper format for wc_get_products
        $category_ids = explode(',', $category);
        $category_ids = array_map('intval', $category_ids); // Ensure integers
        $category_ids = array_filter($category_ids); // Remove empty values
        
        error_log('Category filtering - Original: ' . $category . ', Processed: ' . print_r($category_ids, true));
        
        if (!empty($category_ids)) {
            // Primary approach: Use tax_query (most reliable for WooCommerce)
            $args['tax_query'] = [
                [
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $category_ids,
                    'operator' => 'IN',
                ]
            ];
            
            // Verify categories exist
            $existing_categories = get_terms([
                'taxonomy' => 'product_cat',
                'include' => $category_ids,
                'hide_empty' => false,
            ]);
            
            $existing_ids = array_map(function($cat) { return $cat->term_id; }, $existing_categories);
            error_log('Existing category IDs: ' . print_r($existing_ids, true));
            
            // If no valid categories found, don't apply filter
            if (empty($existing_categories)) {
                error_log('Warning: No valid categories found for IDs: ' . implode(', ', $category_ids));
                unset($args['tax_query']);
            }
        }
    }

    if ($min_price) {
        $args['min_price'] = $min_price;
    }

    if ($max_price) {
        $args['max_price'] = $max_price;
    }

    error_log('WooCommerce query args: ' . print_r($args, true));

    // Get products
    $products = wc_get_products($args);
    
    // If category filtering returned no results but we expected some, try alternative approach
    if (empty($products) && !empty($category)) {
        error_log('No products found with tax_query, trying alternative approach...');
        
        // Remove tax_query and try with direct category parameter
        $alt_args = $args;
        unset($alt_args['tax_query']);
        
        $category_ids = explode(',', $category);
        $category_ids = array_map('intval', $category_ids);
        $category_ids = array_filter($category_ids);
        
        if (!empty($category_ids)) {
            $alt_args['category'] = $category_ids;
            $products = wc_get_products($alt_args);
            error_log('Alternative approach found: ' . count($products) . ' products');
        }
    }
    
    $total_products = wc_get_products(array_merge($args, ['limit' => -1, 'offset' => 0]));
    $total = count($total_products);

    error_log('Products found: ' . count($products) . ' out of ' . $total . ' total');

    // Format products for API response
    $formatted_products = [];
    foreach ($products as $product) {
        $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
        $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
        
        // Get promotion data
        $is_promotion = get_post_meta($product->get_id(), '_is_promotion', true) === 'yes';
        $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
        $promotion_label = get_post_meta($product->get_id(), '_promotion_label', true);
        $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
        $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
        
        // Check if promotion is currently active
        $promotion_active = false;
        if ($is_promotion) {
            $current_date = current_time('Y-m-d');
            $promotion_active = true;
            
            if ($promotion_start_date && $current_date < $promotion_start_date) {
                $promotion_active = false;
            }
            
            if ($promotion_end_date && $current_date > $promotion_end_date) {
                $promotion_active = false;
            }
        }
        
        $product_data = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'description' => wpautop($product->get_description()),
            'short_description' => wpautop($product->get_short_description()),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'dealer_price' => $dealer_price ?: null,
            'is_dealer_only' => $is_dealer_only,
            'is_promotion' => $promotion_active,
            'promotion_price' => $promotion_active && $promotion_price ? $promotion_price : null,
            'promotion_label' => $promotion_active && $promotion_label ? $promotion_label : null,
            'promotion_start_date' => $promotion_start_date ?: null,
            'promotion_end_date' => $promotion_end_date ?: null,
            'stock_status' => $product->get_stock_status(),
            'stock_quantity' => $product->get_stock_quantity(),
            'type' => $product->get_type(),
            'images' => array_map(function($image_id) {
                return [
                    'id' => $image_id,
                    'src' => wp_get_attachment_url($image_id),
                    'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                ];
            }, $product->get_gallery_image_ids()),
            'categories' => array_map(function($term) use ($language) {
                return fitbody_format_category_for_api($term, $language);
            }, get_the_terms($product->get_id(), 'product_cat') ?: []),
            'meta_data' => [],
        ];

        // Add main product image if exists
        $main_image_id = $product->get_image_id();
        if ($main_image_id) {
            array_unshift($product_data['images'], [
                'id' => $main_image_id,
                'src' => wp_get_attachment_url($main_image_id),
                'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
            ]);
        }

        // Add variations for variable products
        if ($product->is_type('variable')) {
            $variations = [];
            $variation_ids = $product->get_children();
            
            foreach ($variation_ids as $variation_id) {
                $variation = wc_get_product($variation_id);
                if ($variation && $variation->exists()) {
                    $variation_image_id = $variation->get_image_id();
                    
                    // Get dealer price for this variation
                    $variation_dealer_price = get_post_meta($variation_id, '_dealer_price', true);
                    
                    $variation_data = [
                        'id' => $variation->get_id(),
                        'price' => $variation->get_price(),
                        'regular_price' => $variation->get_regular_price(),
                        'sale_price' => $variation->get_sale_price(),
                        'stock_status' => $variation->get_stock_status(),
                        'stock_quantity' => $variation->get_stock_quantity(),
                        'attributes' => $variation->get_variation_attributes(),
                        'image' => $variation_image_id ? [
                            'id' => $variation_image_id,
                            'src' => wp_get_attachment_url($variation_image_id),
                            'alt' => get_post_meta($variation_image_id, '_wp_attachment_image_alt', true),
                        ] : null,
                    ];
                    
                    // Add dealer price if it exists
                    if (!empty($variation_dealer_price)) {
                        $variation_data['dealer_price'] = $variation_dealer_price;
                    }
                    
                    $variations[] = $variation_data;
                }
            }
            $product_data['variations'] = $variations;

            // Add attributes
            $attributes = [];
            foreach ($product->get_attributes() as $attribute) {
                if ($attribute->get_variation()) {
                    $attributes[] = [
                        'id' => $attribute->get_id(),
                        'name' => $attribute->get_name(),
                        'slug' => sanitize_title($attribute->get_name()),
                        'options' => $attribute->get_options(),
                        'variation' => $attribute->get_variation(),
                        'visible' => $attribute->get_visible(),
                    ];
                }
            }
            $product_data['attributes'] = $attributes;
        }

        $formatted_products[] = $product_data;
    }

    // Create response with headers
    $response = rest_ensure_response($formatted_products);
    $response->header('X-WP-Total', $total);
    $response->header('X-WP-TotalPages', ceil($total / $per_page));

    return $response;
}

/**
 * Proxy WooCommerce single product API
 */
function fitbody_proxy_woocommerce_product($request) {
    if (!function_exists('wc_get_product')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    $product_id = $request->get_param('id');
    $language = $request->get_param('lang') ?: 'mk';
    $product = wc_get_product($product_id);

    if (!$product || $product->get_status() !== 'publish') {
        return new WP_Error('product_not_found', 'Product not found', ['status' => 404]);
    }

    // Format product for API response
    $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
    $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
    
    // Get promotion data
    $is_promotion = get_post_meta($product->get_id(), '_is_promotion', true) === 'yes';
    $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
    $promotion_label = get_post_meta($product->get_id(), '_promotion_label', true);
    $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
    $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
    
    // Check if promotion is currently active
    $promotion_active = false;
    if ($is_promotion) {
        $current_date = current_time('Y-m-d');
        $promotion_active = true;
        
        if ($promotion_start_date && $current_date < $promotion_start_date) {
            $promotion_active = false;
        }
        
        if ($promotion_end_date && $current_date > $promotion_end_date) {
            $promotion_active = false;
        }
    }
    
    $formatted_product = [
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'description' => wpautop($product->get_description()),
        'short_description' => wpautop($product->get_short_description()),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'dealer_price' => $dealer_price ?: null,
        'is_dealer_only' => $is_dealer_only,
        'is_promotion' => $promotion_active,
        'promotion_price' => $promotion_active && $promotion_price ? $promotion_price : null,
        'promotion_label' => $promotion_active && $promotion_label ? $promotion_label : null,
        'promotion_start_date' => $promotion_start_date ?: null,
        'promotion_end_date' => $promotion_end_date ?: null,
        'stock_status' => $product->get_stock_status(),
        'stock_quantity' => $product->get_stock_quantity(),
        'images' => array_map(function($image_id) {
            return [
                'id' => $image_id,
                'src' => wp_get_attachment_url($image_id),
                'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
            ];
        }, $product->get_gallery_image_ids()),
        'categories' => array_map(function($term) use ($language) {
            return fitbody_format_category_for_api($term, $language);
        }, get_the_terms($product->get_id(), 'product_cat') ?: []),
        'meta_data' => [],
    ];

    // Add main product image if exists
    $main_image_id = $product->get_image_id();
    if ($main_image_id) {
        array_unshift($formatted_product['images'], [
            'id' => $main_image_id,
            'src' => wp_get_attachment_url($main_image_id),
            'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
        ]);
    }

    return rest_ensure_response($formatted_product);
}

/**
 * Proxy WooCommerce categories API
 */
function fitbody_proxy_woocommerce_categories($request) {
    if (!function_exists('get_terms')) {
        return new WP_Error('wordpress_not_active', 'WordPress is not active', ['status' => 500]);
    }

    // Get language parameter from request
    $language = $request->get_param('lang') ?: 'mk';

    $categories = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ]);

    if (is_wp_error($categories)) {
        return $categories;
    }

    $formatted_categories = array_map(function($category) use ($language) {
        return [
            'id' => $category->term_id,
            'name' => fitbody_get_category_name($category, $language),
            'slug' => $category->slug,
            'description' => $category->description,
            'count' => $category->count,
            'translations' => fitbody_get_category_translations($category),
        ];
    }, $categories);

    return rest_ensure_response($formatted_categories);
}

/**
 * Get promotion products
 */
function fitbody_get_promotions($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Get parameters from request
    $page = $request->get_param('page') ?: 1;
    $per_page = $request->get_param('per_page') ?: 12;

    // Get all products that are marked as promotions
    $args = [
        'status' => 'publish',
        'limit' => -1, // Get all first, then filter
        'meta_query' => [
            [
                'key' => '_is_promotion',
                'value' => 'yes',
                'compare' => '='
            ]
        ]
    ];

    $all_promotion_products = wc_get_products($args);
    $active_promotions = [];

    // Filter by active promotions (check dates and promotion price)
    $current_date = current_time('Y-m-d');
    
    foreach ($all_promotion_products as $product) {
        $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
        $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
        $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
        
        // Skip if no promotion price is set
        if (empty($promotion_price) || !is_numeric($promotion_price)) {
            continue;
        }
        
        $is_active = true;
        
        if ($promotion_start_date && $current_date < $promotion_start_date) {
            $is_active = false;
        }
        
        if ($promotion_end_date && $current_date > $promotion_end_date) {
            $is_active = false;
        }
        
        if ($is_active) {
            $active_promotions[] = $product;
        }
    }

    // Apply pagination
    $total = count($active_promotions);
    $offset = ($page - 1) * $per_page;
    $products = array_slice($active_promotions, $offset, $per_page);

    // Format products for API response
    $formatted_products = [];
    foreach ($products as $product) {
        $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
        $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
        
        // Get promotion data
        $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
        $promotion_label = get_post_meta($product->get_id(), '_promotion_label', true);
        $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
        $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
        
        $product_data = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'description' => wpautop($product->get_description()),
            'short_description' => wpautop($product->get_short_description()),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'dealer_price' => $dealer_price ?: null,
            'is_dealer_only' => $is_dealer_only,
            'is_promotion' => true,
            'promotion_price' => $promotion_price ?: null,
            'promotion_label' => $promotion_label ?: null,
            'promotion_start_date' => $promotion_start_date ?: null,
            'promotion_end_date' => $promotion_end_date ?: null,
            'stock_status' => $product->get_stock_status(),
            'stock_quantity' => $product->get_stock_quantity(),
            'type' => $product->get_type(),
            'images' => array_map(function($image_id) {
                return [
                    'id' => $image_id,
                    'src' => wp_get_attachment_url($image_id),
                    'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                ];
            }, $product->get_gallery_image_ids()),
            'categories' => array_map(function($term) {
                return [
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];
            }, get_the_terms($product->get_id(), 'product_cat') ?: []),
            'meta_data' => [],
        ];

        // Add main product image if exists
        $main_image_id = $product->get_image_id();
        if ($main_image_id) {
            array_unshift($product_data['images'], [
                'id' => $main_image_id,
                'src' => wp_get_attachment_url($main_image_id),
                'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
            ]);
        }

        $formatted_products[] = $product_data;
    }

    // Create response with headers
    $response = rest_ensure_response($formatted_products);
    $response->header('X-WP-Total', $total);
    $response->header('X-WP-TotalPages', ceil($total / $per_page));

    return $response;
}

/**
 * Get categories configured for home page display
 */
function fitbody_get_home_categories($request) {
    if (!function_exists('get_terms')) {
        return new WP_Error('wordpress_not_active', 'WordPress is not active', ['status' => 500]);
    }

    // Get language parameter from request
    $language = $request->get_param('lang') ?: 'mk';

    // Get all product categories
    $categories = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ]);

    if (is_wp_error($categories)) {
        return $categories;
    }

    $home_categories = [];

    foreach ($categories as $category) {
        $show_on_home = get_term_meta($category->term_id, '_show_on_home', true);
        
        // Only include categories marked to show on home page
        if ($show_on_home === '1') {
            $home_icon = get_term_meta($category->term_id, '_home_icon', true);
            $home_order = get_term_meta($category->term_id, '_home_order', true);
            
            // Count products in this category
            $product_count = 0;
            if (function_exists('wc_get_products')) {
                $products = wc_get_products([
                    'status' => 'publish',
                    'limit' => -1,
                    'tax_query' => [
                        [
                            'taxonomy' => 'product_cat',
                            'field'    => 'term_id',
                            'terms'    => [$category->term_id],
                        ]
                    ],
                ]);
                $product_count = count($products);
            }
            
            $home_categories[] = [
                'id' => $category->term_id,
                'name' => fitbody_get_category_name($category, $language),
                'slug' => $category->slug,
                'description' => $category->description,
                'count' => $product_count,
                'icon' => $home_icon ?: '📦', // Default icon if none set
                'order' => intval($home_order ?: 999), // Default high order if none set
                'href' => '/products?category=' . $category->term_id,
                'translations' => fitbody_get_category_translations($category),
            ];
        }
    }

    // Sort by order
    usort($home_categories, function($a, $b) {
        return $a['order'] - $b['order'];
    });

    return rest_ensure_response($home_categories);
}

/**
 * Proxy WooCommerce single product API by slug
 */
function fitbody_proxy_woocommerce_product_by_slug($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    $slug = $request->get_param('slug');
    
    // URL decode the slug to handle Cyrillic and other special characters
    $decoded_slug = urldecode($slug);
    
    // Log both versions for debugging
    error_log('=== PRODUCT BY SLUG DEBUG ===');
    error_log('Original slug: ' . $slug);
    error_log('Decoded slug: ' . $decoded_slug);
    
    // Try using get_page_by_path first (most reliable for exact slug match)
    $post = get_page_by_path($decoded_slug, OBJECT, 'product');
    
    if (!$post) {
        error_log('Not found with decoded slug, trying original');
        $post = get_page_by_path($slug, OBJECT, 'product');
    }
    
    $product = null;
    
    if ($post && $post->post_status === 'publish') {
        error_log('Found via get_page_by_path: ' . $post->ID);
        $product = wc_get_product($post->ID);
    }
    
    // Fallback to wc_get_products if get_page_by_path didn't work
    if (!$product) {
        error_log('Trying wc_get_products as fallback');
        $products = wc_get_products([
            'slug' => $decoded_slug,
            'status' => 'publish',
            'limit' => 1,
        ]);
        
        if (empty($products)) {
            $products = wc_get_products([
                'slug' => $slug,
                'status' => 'publish',
                'limit' => 1,
            ]);
        }
        
        if (!empty($products)) {
            $product = $products[0];
            error_log('Found via wc_get_products: ' . $product->get_id());
        }
    }
    
    if (!$product) {
        error_log('Product not found for slug: ' . $slug . ' (decoded: ' . $decoded_slug . ')');
        return new WP_Error('product_not_found', 'Product not found', ['status' => 404]);
    }
    
    error_log('Final product: ' . $product->get_name() . ' (ID: ' . $product->get_id() . ', Slug: ' . $product->get_slug() . ')');
    error_log('Product image ID: ' . $product->get_image_id());

    // Format product for API response
    $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
    $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
    
    // Get promotion data
    $is_promotion = get_post_meta($product->get_id(), '_is_promotion', true) === 'yes';
    $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
    $promotion_label = get_post_meta($product->get_id(), '_promotion_label', true);
    $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
    $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
    
    // Check if promotion is currently active
    $promotion_active = false;
    if ($is_promotion) {
        $current_date = current_time('Y-m-d');
        $promotion_active = true;
        
        if ($promotion_start_date && $current_date < $promotion_start_date) {
            $promotion_active = false;
        }
        
        if ($promotion_end_date && $current_date > $promotion_end_date) {
            $promotion_active = false;
        }
    }
    
    $formatted_product = [
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'description' => wpautop($product->get_description()),
        'short_description' => wpautop($product->get_short_description()),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'dealer_price' => $dealer_price ?: null,
        'is_dealer_only' => $is_dealer_only,
        'is_promotion' => $promotion_active,
        'promotion_price' => $promotion_active && $promotion_price ? $promotion_price : null,
        'promotion_label' => $promotion_active && $promotion_label ? $promotion_label : null,
        'promotion_start_date' => $promotion_start_date ?: null,
        'promotion_end_date' => $promotion_end_date ?: null,
        'stock_status' => $product->get_stock_status(),
        'stock_quantity' => $product->get_stock_quantity(),
        'type' => $product->get_type(),
        'images' => array_map(function($image_id) {
            return [
                'id' => $image_id,
                'src' => wp_get_attachment_url($image_id),
                'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
            ];
        }, $product->get_gallery_image_ids()),
        'categories' => array_map(function($term) {
            return [
                'id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }, get_the_terms($product->get_id(), 'product_cat') ?: []),
        'meta_data' => [],
    ];

    // Add main product image if exists
    $main_image_id = $product->get_image_id();
    if ($main_image_id) {
        array_unshift($formatted_product['images'], [
            'id' => $main_image_id,
            'src' => wp_get_attachment_url($main_image_id),
            'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
        ]);
    }

    // Add variations for variable products
    if ($product->is_type('variable')) {
        $variations = [];
        $variation_ids = $product->get_children();
        
        foreach ($variation_ids as $variation_id) {
            $variation = wc_get_product($variation_id);
            if ($variation && $variation->exists()) {
                $variation_image_id = $variation->get_image_id();
                
                // Get dealer price for this variation
                $variation_dealer_price = get_post_meta($variation_id, '_dealer_price', true);
                
                $variation_data = [
                    'id' => $variation->get_id(),
                    'price' => $variation->get_price(),
                    'regular_price' => $variation->get_regular_price(),
                    'sale_price' => $variation->get_sale_price(),
                    'stock_status' => $variation->get_stock_status(),
                    'stock_quantity' => $variation->get_stock_quantity(),
                    'attributes' => $variation->get_variation_attributes(),
                    'image' => $variation_image_id ? [
                        'id' => $variation_image_id,
                        'src' => wp_get_attachment_url($variation_image_id),
                        'alt' => get_post_meta($variation_image_id, '_wp_attachment_image_alt', true),
                    ] : null,
                ];
                
                // Add dealer price if it exists
                if (!empty($variation_dealer_price)) {
                    $variation_data['dealer_price'] = $variation_dealer_price;
                }
                
                $variations[] = $variation_data;
            }
        }
        $formatted_product['variations'] = $variations;

        // Add attributes
        $attributes = [];
        foreach ($product->get_attributes() as $attribute) {
            if ($attribute->get_variation()) {
                $attributes[] = [
                    'id' => $attribute->get_id(),
                    'name' => $attribute->get_name(),
                    'slug' => sanitize_title($attribute->get_name()),
                    'options' => $attribute->get_options(),
                    'variation' => $attribute->get_variation(),
                    'visible' => $attribute->get_visible(),
                ];
            }
        }
        $formatted_product['attributes'] = $attributes;
    }

    return rest_ensure_response($formatted_product);
}

/**
 * Add custom fields to product admin for featured/recommended ordering
 */
function fitbody_add_product_featured_fields() {
    global $post;
    
    if (!$post || $post->post_type !== 'product') {
        return;
    }
    
    $featured_order = get_post_meta($post->ID, '_featured_order', true);
    $is_featured = get_post_meta($post->ID, '_is_featured', true) === 'yes';
    
    echo '<div class="options_group">';
    
    // Featured product checkbox
    woocommerce_wp_checkbox([
        'id' => '_is_featured',
        'label' => __('Featured Product', 'woocommerce'),
        'description' => __('Mark this product as featured to show in recommended products section.', 'woocommerce'),
        'value' => $is_featured ? 'yes' : 'no',
    ]);
    
    // Featured order field
    woocommerce_wp_text_input([
        'id' => '_featured_order',
        'label' => __('Featured Order', 'woocommerce'),
        'description' => __('Order number for featured products (lower numbers appear first). Leave empty for default ordering.', 'woocommerce'),
        'type' => 'number',
        'custom_attributes' => [
            'step' => '1',
            'min' => '0',
        ],
        'value' => $featured_order,
    ]);
    
    echo '</div>';
}
add_action('woocommerce_product_options_general_product_data', 'fitbody_add_product_featured_fields');

/**
 * Save custom product fields
 */
function fitbody_save_product_featured_fields($post_id) {
    // Save featured status
    $is_featured = isset($_POST['_is_featured']) ? 'yes' : 'no';
    update_post_meta($post_id, '_is_featured', $is_featured);
    
    // Save featured order
    if (isset($_POST['_featured_order'])) {
        $featured_order = intval($_POST['_featured_order']);
        update_post_meta($post_id, '_featured_order', $featured_order);
    }
}
add_action('woocommerce_process_product_meta', 'fitbody_save_product_featured_fields');

/**
 * Get featured products in custom order
 */
function fitbody_get_featured_products($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Get parameters from request
    $per_page = $request->get_param('per_page') ?: 8;
    $language = $request->get_param('lang') ?: 'mk';

    error_log('Featured products API called with per_page: ' . $per_page . ', lang: ' . $language);

    // Get all featured products
    $args = [
        'status' => 'publish',
        'limit' => -1, // Get all featured products first
        'meta_query' => [
            [
                'key' => '_is_featured',
                'value' => 'yes',
                'compare' => '='
            ]
        ]
    ];

    $featured_products = wc_get_products($args);
    
    error_log('Found ' . count($featured_products) . ' featured products');

    // Sort by featured order (custom field)
    usort($featured_products, function($a, $b) {
        $order_a = get_post_meta($a->get_id(), '_featured_order', true);
        $order_b = get_post_meta($b->get_id(), '_featured_order', true);
        
        // Convert to integers, default to 999 if empty
        $order_a = $order_a !== '' ? intval($order_a) : 999;
        $order_b = $order_b !== '' ? intval($order_b) : 999;
        
        // If orders are the same, sort by product ID (creation order)
        if ($order_a === $order_b) {
            return $a->get_id() - $b->get_id();
        }
        
        return $order_a - $order_b;
    });

    // Limit to requested number
    $products = array_slice($featured_products, 0, $per_page);
    
    error_log('Returning ' . count($products) . ' featured products after sorting and limiting');

    // Format products for API response
    $formatted_products = [];
    foreach ($products as $product) {
        $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
        $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
        $featured_order = get_post_meta($product->get_id(), '_featured_order', true);
        
        // Get promotion data
        $is_promotion = get_post_meta($product->get_id(), '_is_promotion', true) === 'yes';
        $promotion_price = get_post_meta($product->get_id(), '_promotion_price', true);
        $promotion_label = get_post_meta($product->get_id(), '_promotion_label', true);
        $promotion_start_date = get_post_meta($product->get_id(), '_promotion_start_date', true);
        $promotion_end_date = get_post_meta($product->get_id(), '_promotion_end_date', true);
        
        // Check if promotion is currently active
        $promotion_active = false;
        if ($is_promotion) {
            $current_date = current_time('Y-m-d');
            $promotion_active = true;
            
            if ($promotion_start_date && $current_date < $promotion_start_date) {
                $promotion_active = false;
            }
            
            if ($promotion_end_date && $current_date > $promotion_end_date) {
                $promotion_active = false;
            }
        }
        
        $product_data = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'description' => wpautop($product->get_description()),
            'short_description' => wpautop($product->get_short_description()),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'dealer_price' => $dealer_price ?: null,
            'is_dealer_only' => $is_dealer_only,
            'is_promotion' => $promotion_active,
            'promotion_price' => $promotion_active && $promotion_price ? $promotion_price : null,
            'promotion_label' => $promotion_active && $promotion_label ? $promotion_label : null,
            'promotion_start_date' => $promotion_start_date ?: null,
            'promotion_end_date' => $promotion_end_date ?: null,
            'stock_status' => $product->get_stock_status(),
            'stock_quantity' => $product->get_stock_quantity(),
            'type' => $product->get_type(),
            'featured_order' => $featured_order !== '' ? intval($featured_order) : null,
            'images' => array_map(function($image_id) {
                return [
                    'id' => $image_id,
                    'src' => wp_get_attachment_url($image_id),
                    'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                ];
            }, $product->get_gallery_image_ids()),
            'categories' => array_map(function($term) use ($language) {
                return fitbody_format_category_for_api($term, $language);
            }, get_the_terms($product->get_id(), 'product_cat') ?: []),
            'meta_data' => [],
        ];

        // Add main product image if exists
        $main_image_id = $product->get_image_id();
        if ($main_image_id) {
            array_unshift($product_data['images'], [
                'id' => $main_image_id,
                'src' => wp_get_attachment_url($main_image_id),
                'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
            ]);
        }

        // Add variations for variable products
        if ($product->is_type('variable')) {
            $variations = [];
            $variation_ids = $product->get_children();
            
            foreach ($variation_ids as $variation_id) {
                $variation = wc_get_product($variation_id);
                if ($variation && $variation->exists()) {
                    $variation_image_id = $variation->get_image_id();
                    
                    // Get dealer price for this variation
                    $variation_dealer_price = get_post_meta($variation_id, '_dealer_price', true);
                    
                    $variation_data = [
                        'id' => $variation->get_id(),
                        'price' => $variation->get_price(),
                        'regular_price' => $variation->get_regular_price(),
                        'sale_price' => $variation->get_sale_price(),
                        'stock_status' => $variation->get_stock_status(),
                        'stock_quantity' => $variation->get_stock_quantity(),
                        'attributes' => $variation->get_variation_attributes(),
                        'image' => $variation_image_id ? [
                            'id' => $variation_image_id,
                            'src' => wp_get_attachment_url($variation_image_id),
                            'alt' => get_post_meta($variation_image_id, '_wp_attachment_image_alt', true),
                        ] : null,
                    ];
                    
                    // Add dealer price if it exists
                    if (!empty($variation_dealer_price)) {
                        $variation_data['dealer_price'] = $variation_dealer_price;
                    }
                    
                    $variations[] = $variation_data;
                }
            }
            $product_data['variations'] = $variations;

            // Add attributes
            $attributes = [];
            foreach ($product->get_attributes() as $attribute) {
                if ($attribute->get_variation()) {
                    $attributes[] = [
                        'id' => $attribute->get_id(),
                        'name' => $attribute->get_name(),
                        'slug' => sanitize_title($attribute->get_name()),
                        'options' => $attribute->get_options(),
                        'variation' => $attribute->get_variation(),
                        'visible' => $attribute->get_visible(),
                    ];
                }
            }
            $product_data['attributes'] = $attributes;
        }

        // Apply language-specific translations
        $product_data = fitbody_add_language_to_product_data($product_data, $product, $language);

        $formatted_products[] = $product_data;
    }

    return rest_ensure_response($formatted_products);
}

function fitbody_proxy_get_cart($request) {
    $session_token = fitbody_get_session_token();
    $user = wp_get_current_user();
    $user_id = $user && $user->ID > 0 ? $user->ID : null;
    
    error_log('GET CART - Session: ' . $session_token . ', User ID: ' . ($user_id ?: 'guest'));
    
    $cart_data = fitbody_format_cart_response($session_token, $user_id);
    
    $response = rest_ensure_response($cart_data);
    $response->header('X-Cart-Session', $session_token);
    
    return $response;
}

function fitbody_proxy_add_to_cart($request) {
    try {
        $product_id = $request->get_param('id');
        $quantity = $request->get_param('quantity') ?: 1;
        $variation_id = $request->get_param('variation_id') ?: null;
        $variation_data = $request->get_param('variation_data') ?: null;

        if (!$product_id) {
            return new WP_Error('missing_product_id', 'Product ID is required', ['status' => 400]);
        }

        // Get session token and user
        $session_token = fitbody_get_session_token();
        $user = wp_get_current_user();
        $user_id = $user && $user->ID > 0 ? $user->ID : null;
        
        error_log('ADD TO CART - Session: ' . $session_token . ', User: ' . ($user_id ?: 'guest') . ', Product: ' . $product_id);

        // Validate product exists
        $product = wc_get_product($product_id);
        if (!$product || !$product->exists()) {
            return new WP_Error('invalid_product', 'Product not found', ['status' => 404]);
        }

        // Validate variable products
        if ($product->is_type('variable') && !$variation_id) {
            return new WP_Error('missing_variation', 'Variation ID is required for variable products', ['status' => 400]);
        }

        // Add to custom cart
        $cart_item_id = fitbody_add_cart_item($session_token, $product_id, $quantity, $variation_id, $variation_data, $user_id);
        
        if (!$cart_item_id) {
            return new WP_Error('add_failed', 'Failed to add item to cart', ['status' => 500]);
        }
        
        error_log('Successfully added to cart with ID: ' . $cart_item_id);
        
        // Return updated cart
        $cart_data = fitbody_format_cart_response($session_token, $user_id);
        $cart_data['success'] = true;
        $cart_data['message'] = 'Product added to cart';
        $cart_data['cart_item_key'] = (string)$cart_item_id;
        
        $response = rest_ensure_response($cart_data);
        $response->header('X-Cart-Session', $session_token);
        
        return $response;
        
    } catch (Exception $e) {
        error_log('Add to cart exception: ' . $e->getMessage());
        return new WP_Error('add_to_cart_error', 'An error occurred: ' . $e->getMessage(), ['status' => 500]);
    }
}

function fitbody_proxy_update_cart_item($request) {
    $cart_item_id = $request->get_param('key');
    $quantity = $request->get_param('quantity');

    error_log("Cart update request - Key: {$cart_item_id}, Quantity: {$quantity}");

    if (!$cart_item_id || !isset($quantity)) {
        error_log('Cart update failed: Missing parameters');
        return new WP_Error('missing_parameters', 'Key and quantity are required', ['status' => 400]);
    }

    // Validate quantity is a non-negative integer
    $quantity = intval($quantity);
    if ($quantity < 0) {
        error_log('Cart update failed: Invalid quantity');
        return new WP_Error('invalid_quantity', 'Quantity must be a non-negative integer', ['status' => 400]);
    }

    $session_token = fitbody_get_session_token();
    $user = wp_get_current_user();
    $user_id = $user && $user->ID > 0 ? $user->ID : null;
    
    error_log('UPDATE CART - Session: ' . $session_token . ', Item ID: ' . $cart_item_id . ', Quantity: ' . $quantity);

    try {
        // Update quantity (or remove if quantity is 0)
        $success = fitbody_update_cart_item($cart_item_id, $quantity);

        if ($success !== false) {
            $cart_data = fitbody_format_cart_response($session_token, $user_id);
            $cart_data['success'] = true;
            $cart_data['message'] = $quantity === 0 ? 'Cart item removed' : 'Cart item updated';
            
            $response = rest_ensure_response($cart_data);
            $response->header('X-Cart-Session', $session_token);
            
            return $response;
        } else {
            error_log("Cart update failed for item {$cart_item_id}");
            return new WP_Error('update_failed', 'Failed to update cart item', ['status' => 500]);
        }
    } catch (Exception $e) {
        error_log('Cart update exception: ' . $e->getMessage());
        return new WP_Error('update_error', $e->getMessage(), ['status' => 500]);
    }
}

function fitbody_proxy_remove_cart_item($request) {
    $cart_item_id = $request->get_param('key');

    if (!$cart_item_id) {
        return new WP_Error('missing_key', 'Cart item key is required', ['status' => 400]);
    }

    $session_token = fitbody_get_session_token();
    $user = wp_get_current_user();
    $user_id = $user && $user->ID > 0 ? $user->ID : null;
    
    error_log('REMOVE FROM CART - Session: ' . $session_token . ', Item ID: ' . $cart_item_id);

    $success = fitbody_remove_cart_item($cart_item_id);

    if ($success) {
        $cart_data = fitbody_format_cart_response($session_token, $user_id);
        $cart_data['success'] = true;
        $cart_data['message'] = 'Cart item removed';
        
        $response = rest_ensure_response($cart_data);
        $response->header('X-Cart-Session', $session_token);
        
        return $response;
    } else {
        return new WP_Error('remove_failed', 'Failed to remove cart item', ['status' => 500]);
    }
}

/**
 * Simple REST debug endpoint
 */
function fitbody_register_debug_endpoint() {
    register_rest_route('fitbody/v1', '/debug', [
        'methods'  => 'GET',
        'callback' => function () {
            $product_count = 0;
            $published_products = 0;
            
            if (function_exists('wc_get_products')) {
                $all_products = wc_get_products(['limit' => -1, 'status' => 'any']);
                $product_count = count($all_products);
                
                $published = wc_get_products(['limit' => -1, 'status' => 'publish']);
                $published_products = count($published);
            }
            
            return [
                'status'      => 'working',
                'theme'       => 'FitBody.mk E-commerce',
                'time'        => current_time('mysql'),
                'theme_url'   => get_template_directory_uri(),
                'theme_dir'   => get_template_directory(),
                'export_html' => file_exists(get_template_directory() . '/index.html'),
                'jwt_plugin'  => class_exists('Jwt_Auth_Public'),
                'woocommerce' => class_exists('WooCommerce'),
                'wc_version'  => defined('WC_VERSION') ? WC_VERSION : 'not installed',
                'total_products' => $product_count,
                'published_products' => $published_products,
                'shop_page_id' => get_option('woocommerce_shop_page_id'),
                'currency' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'unknown',
            ];
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_debug_endpoint');

/**
 * Debug endpoint for variable products
 */
function fitbody_register_variable_product_debug_endpoint() {
    register_rest_route('fitbody/v1', '/debug/variable-product/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'fitbody_debug_variable_product',
        'permission_callback' => '__return_true',
    ]);
}

function fitbody_debug_variable_product($request) {
    $product_id = $request->get_param('id');
    
    if (!$product_id) {
        return new WP_Error('missing_product_id', 'Product ID is required', ['status' => 400]);
    }
    
    $product = wc_get_product($product_id);
    
    if (!$product || !$product->exists()) {
        return new WP_Error('invalid_product', 'Product not found', ['status' => 404]);
    }
    
    $debug_info = [
        'product_id' => $product_id,
        'product_name' => $product->get_name(),
        'product_type' => $product->get_type(),
        'is_variable' => $product->is_type('variable'),
        'is_purchasable' => $product->is_purchasable(),
        'stock_status' => $product->get_stock_status(),
        'variations' => [],
        'attributes' => []
    ];
    
    if ($product->is_type('variable')) {
        $variation_ids = $product->get_children();
        
        foreach ($variation_ids as $variation_id) {
            $variation = wc_get_product($variation_id);
            if ($variation && $variation->exists()) {
                $debug_info['variations'][] = [
                    'id' => $variation->get_id(),
                    'name' => $variation->get_name(),
                    'price' => $variation->get_price(),
                    'stock_status' => $variation->get_stock_status(),
                    'is_purchasable' => $variation->is_purchasable(),
                    'attributes' => $variation->get_variation_attributes(),
                ];
            }
        }
        
        foreach ($product->get_attributes() as $attribute) {
            if ($attribute->get_variation()) {
                $debug_info['attributes'][] = [
                    'name' => $attribute->get_name(),
                    'slug' => sanitize_title($attribute->get_name()),
                    'options' => $attribute->get_options(),
                    'variation' => $attribute->get_variation(),
                    'visible' => $attribute->get_visible(),
                ];
            }
        }
    }
    
    return rest_ensure_response($debug_info);
}
add_action('rest_api_init', 'fitbody_register_variable_product_debug_endpoint');

/**
 * Create WooCommerce order from cart
 */
function fitbody_create_order($request) {
    if (!function_exists('WC')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Initialize WooCommerce
    fitbody_init_woocommerce_for_api();

    // Get order data from request
    $order_data = $request->get_json_params();
    
    // Log the received data for debugging
    error_log('Order creation request data: ' . print_r($order_data, true));
    
    if (!$order_data) {
        error_log('Order creation failed: No order data received');
        return new WP_Error('missing_order_data', 'Order data is required', ['status' => 400]);
    }

    // Validate required fields (email is optional)
    $required_fields = ['firstName', 'lastName', 'phone', 'address', 'city'];
    foreach ($required_fields as $field) {
        if (empty($order_data[$field])) {
            error_log("Order creation failed: Missing field {$field}");
            return new WP_Error('missing_field', "Field {$field} is required", ['status' => 400]);
        }
    }

    // Validate email format if provided (but it's optional)
    if (!empty($order_data['email']) && !is_email($order_data['email'])) {
        error_log("Order creation failed: Invalid email format");
        return new WP_Error('invalid_email', 'Invalid email format', ['status' => 400]);
    }

    try {
        // Create new order
        $order = wc_create_order();
        
        if (is_wp_error($order)) {
            error_log('Order creation failed: ' . $order->get_error_message());
            return new WP_Error('order_creation_failed', 'Failed to create order: ' . $order->get_error_message(), ['status' => 500]);
        }

        error_log('Order created with ID: ' . $order->get_id());

        // Add items to order - prefer cart contents for accurate pricing
        $items_added = 0;
        $is_dealer = false;
        $user = wp_get_current_user();
        if ($user && $user->ID > 0) {
            $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
            $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
            $is_dealer = $is_dealer && $dealer_status === 'approved';
        }
        
        // Get items from CUSTOM DATABASE CART (not WooCommerce cart)
        $session_token = fitbody_get_session_token();
        $user_id = $user && $user->ID > 0 ? $user->ID : null;
        $cart_items = fitbody_get_cart_items($session_token, $user_id);
        
        if (empty($cart_items)) {
            error_log('Order creation failed: Custom cart is empty');
            $order->delete(true);
            return new WP_Error('empty_cart', 'Cart is empty', ['status' => 400]);
        }
        
        error_log('Using custom database cart for order creation - ' . count($cart_items) . ' items');
        
        foreach ($cart_items as $cart_item) {
            $product_id = $cart_item->variation_id ?: $cart_item->product_id;
            $product = wc_get_product($product_id);
            
            if (!$product || !$product->exists()) {
                error_log("Product not found: ID {$product_id}");
                continue;
            }
            
            $quantity = intval($cart_item->quantity);
            
            // Apply dealer pricing if applicable
            if ($is_dealer) {
                $dealer_price = get_post_meta($cart_item->product_id, '_dealer_price', true);
                if ($dealer_price) {
                    $product->set_price($dealer_price);
                }
            }
            
            error_log("Adding product to order: ID {$product_id}, Quantity {$quantity}, Price: {$product->get_price()}");
            
            // Add product to order
            $item_id = $order->add_product($product, $quantity);
            
            if ($item_id) {
                $items_added++;
                
                // Add variation attributes as order item meta
                if ($cart_item->variation_id && $cart_item->variation_data) {
                    $variation_data = json_decode($cart_item->variation_data, true);
                    if (!empty($variation_data)) {
                        $item = $order->get_item($item_id);
                        foreach ($variation_data as $key => $value) {
                            $item->add_meta_data($key, $value, true);
                        }
                        $item->save();
                        error_log("Added variation meta to order item: " . print_r($variation_data, true));
                    }
                }
                
                // Apply dealer pricing to order item if needed
                if ($is_dealer && isset($dealer_price)) {
                    $item = $order->get_item($item_id);
                    if ($item) {
                        $item->set_subtotal($dealer_price * $quantity);
                        $item->set_total($dealer_price * $quantity);
                        $item->save();
                    }
                }
            } else {
                error_log("Failed to add product {$product_id} to order");
            }
        }

        if ($items_added === 0) {
            error_log('Order creation failed: No valid items were added to the order');
            $order->delete(true); // Delete the empty order
            return new WP_Error('no_valid_items', 'No valid items could be added to the order', ['status' => 400]);
        }

        // Set billing address
        $billing_address = [
            'first_name' => sanitize_text_field($order_data['firstName']),
            'last_name'  => sanitize_text_field($order_data['lastName']),
            'phone'      => sanitize_text_field($order_data['phone']),
            'address_1'  => sanitize_text_field($order_data['address']),
            'city'       => sanitize_text_field($order_data['city']),
            'postcode'   => sanitize_text_field($order_data['postalCode'] ?? ''),
            'country'    => 'MK',
        ];

        // Add email only if provided
        if (!empty($order_data['email'])) {
            $billing_address['email'] = sanitize_email($order_data['email']);
        }

        error_log('Setting billing address: ' . print_r($billing_address, true));

        $order->set_address($billing_address, 'billing');
        $order->set_address($billing_address, 'shipping');

        // Set customer ID if user is logged in
        if ($user && $user->ID > 0) {
            $order->set_customer_id($user->ID);
            error_log('Set customer ID: ' . $user->ID);
        }

        // Set payment method
        $order->set_payment_method('cod'); // Cash on delivery
        $order->set_payment_method_title('Плаќање при достава');

        // Add order notes if provided
        if (!empty($order_data['notes'])) {
            $order->add_order_note(sanitize_textarea_field($order_data['notes']));
        }

        // Add shipping cost based on order total
        $subtotal = $order->get_subtotal();
        $shipping_cost = 0;
        
        // Shipping logic: 150 MKD for orders under 3000 MKD, free for orders over 3000 MKD
        if ($subtotal < 3000) {
            $shipping_cost = 150;
            
            // Create shipping item
            $shipping_item = new WC_Order_Item_Shipping();
            $shipping_item->set_method_title('Стандардна достава');
            $shipping_item->set_method_id('flat_rate');
            $shipping_item->set_total($shipping_cost);
            $order->add_item($shipping_item);
            
            error_log('Added shipping cost: ' . $shipping_cost . ' MKD for order subtotal: ' . $subtotal . ' MKD');
        } else {
            // Free shipping
            $shipping_item = new WC_Order_Item_Shipping();
            $shipping_item->set_method_title('Бесплатна достава');
            $shipping_item->set_method_id('free_shipping');
            $shipping_item->set_total(0);
            $order->add_item($shipping_item);
            
            error_log('Free shipping applied for order subtotal: ' . $subtotal . ' MKD');
        }

        // Calculate totals
        $order->calculate_totals();

        // Set order status
        $order->set_status('processing');

        // Save the order
        $order_id = $order->save();
        
        error_log('Order saved with ID: ' . $order_id);

        // Send notification immediately after order is created
        error_log('Triggering order notification for order: ' . $order_id);
        $notification_sent = fitbody_send_whatsapp_order_notification($order_id);
        error_log('Order notification result: ' . ($notification_sent ? 'SUCCESS' : 'FAILED'));

        // Clear the cart if it exists
        $cart = WC()->cart;
        if ($cart && !$cart->is_empty()) {
            $cart->empty_cart();
            error_log('WooCommerce cart cleared successfully');
        }
        
        // Also clear custom database cart
        $session_token = fitbody_get_session_token();
        $user_id = get_current_user_id() ?: null;
        fitbody_clear_cart($session_token, $user_id);
        error_log('Custom cart cleared successfully');

        // Send order confirmation email (optional, might cause issues)
        try {
            if (class_exists('WC_Emails')) {
                $emails = WC()->mailer()->get_emails();
                if (isset($emails['WC_Email_New_Order'])) {
                    $emails['WC_Email_New_Order']->trigger($order->get_id());
                }
                if (isset($emails['WC_Email_Customer_Processing_Order'])) {
                    $emails['WC_Email_Customer_Processing_Order']->trigger($order->get_id());
                }
            }
        } catch (Exception $email_error) {
            error_log('Email sending failed: ' . $email_error->getMessage());
            // Don't fail the order creation if email fails
        }

        $response_data = [
            'success' => true,
            'order_id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'message' => 'Order created successfully',
            'total' => $order->get_total(),
            'items_added' => $items_added,
        ];
        
        error_log('Order creation successful: ' . print_r($response_data, true));

        return rest_ensure_response($response_data);

    } catch (Exception $e) {
        error_log('Order creation exception: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return new WP_Error('order_creation_error', $e->getMessage(), ['status' => 500]);
    }
}

/**
 * Dealer Management Functions
 */

/**
 * Add dealer fields to user profile
 */
function fitbody_add_dealer_fields($user) {
    ?>
    <h3>Dealer Information</h3>
    <table class="form-table">
        <tr>
            <th><label for="is_dealer">Is Dealer</label></th>
            <td>
                <input type="checkbox" name="is_dealer" id="is_dealer" value="1" <?php checked(get_user_meta($user->ID, 'is_dealer', true), '1'); ?> />
                <span class="description">Check if this user is a dealer</span>
            </td>
        </tr>
        <tr>
            <th><label for="dealer_status">Dealer Status</label></th>
            <td>
                <select name="dealer_status" id="dealer_status">
                    <option value="pending" <?php selected(get_user_meta($user->ID, 'dealer_status', true), 'pending'); ?>>Pending</option>
                    <option value="approved" <?php selected(get_user_meta($user->ID, 'dealer_status', true), 'approved'); ?>>Approved</option>
                    <option value="rejected" <?php selected(get_user_meta($user->ID, 'dealer_status', true), 'rejected'); ?>>Rejected</option>
                    <option value="suspended" <?php selected(get_user_meta($user->ID, 'dealer_status', true), 'suspended'); ?>>Suspended</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="dealer_company">Company Name</label></th>
            <td>
                <input type="text" name="dealer_company" id="dealer_company" value="<?php echo esc_attr(get_user_meta($user->ID, 'dealer_company', true)); ?>" class="regular-text" />
            </td>
        </tr>
        <tr>
            <th><label for="dealer_business_type">Business Type</label></th>
            <td>
                <select name="dealer_business_type" id="dealer_business_type">
                    <option value="">Select Type</option>
                    <option value="retail" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'retail'); ?>>Retail</option>
                    <option value="wholesale" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'wholesale'); ?>>Wholesale</option>
                    <option value="gym" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'gym'); ?>>Gym</option>
                    <option value="pharmacy" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'pharmacy'); ?>>Pharmacy</option>
                    <option value="supplement_store" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'supplement_store'); ?>>Supplement Store</option>
                    <option value="online" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'online'); ?>>Online</option>
                    <option value="other" <?php selected(get_user_meta($user->ID, 'dealer_business_type', true), 'other'); ?>>Other</option>
                </select>
            </td>
        </tr>
    </table>
    <?php
}
add_action('show_user_profile', 'fitbody_add_dealer_fields');
add_action('edit_user_profile', 'fitbody_add_dealer_fields');

/**
 * Save dealer fields
 */
function fitbody_save_dealer_fields($user_id) {
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }

    update_user_meta($user_id, 'is_dealer', isset($_POST['is_dealer']) ? '1' : '0');
    update_user_meta($user_id, 'dealer_status', sanitize_text_field($_POST['dealer_status']));
    update_user_meta($user_id, 'dealer_company', sanitize_text_field($_POST['dealer_company']));
    update_user_meta($user_id, 'dealer_business_type', sanitize_text_field($_POST['dealer_business_type']));
}
add_action('personal_options_update', 'fitbody_save_dealer_fields');
add_action('edit_user_profile_update', 'fitbody_save_dealer_fields');

/**
 * Add dealer price field to products
 */
function fitbody_add_dealer_price_field() {
    global $post;
    
    echo '<div class="options_group">';
    
    woocommerce_wp_text_input(array(
        'id' => '_dealer_price',
        'label' => 'Dealer Price (MKD)',
        'placeholder' => 'Enter dealer price',
        'desc_tip' => true,
        'description' => 'Special price for approved dealers',
        'type' => 'number',
        'custom_attributes' => array(
            'step' => '0.01',
            'min' => '0'
        )
    ));
    
    woocommerce_wp_checkbox(array(
        'id' => '_dealer_only',
        'label' => 'Dealer Only Product',
        'description' => 'This product is only available to approved dealers'
    ));
    
    echo '</div>';
    
    // Add promotion fields
    echo '<div class="options_group">';
    echo '<h4>Promotion Settings</h4>';
    
    woocommerce_wp_checkbox(array(
        'id' => '_is_promotion',
        'label' => 'Is Promotion Product',
        'description' => 'Mark this product as a promotion'
    ));
    
    woocommerce_wp_text_input(array(
        'id' => '_promotion_price',
        'label' => 'Promotion Price (MKD)',
        'placeholder' => 'Enter promotion price',
        'desc_tip' => true,
        'description' => 'Special promotion price (will override sale price)',
        'type' => 'number',
        'custom_attributes' => array(
            'step' => '0.01',
            'min' => '0'
        )
    ));
    
    woocommerce_wp_text_input(array(
        'id' => '_promotion_label',
        'label' => 'Promotion Label',
        'placeholder' => 'e.g., Flash Sale, Limited Time',
        'desc_tip' => true,
        'description' => 'Custom label for the promotion badge'
    ));
    
    woocommerce_wp_text_input(array(
        'id' => '_promotion_start_date',
        'label' => 'Promotion Start Date',
        'placeholder' => 'YYYY-MM-DD',
        'desc_tip' => true,
        'description' => 'When the promotion starts (optional)',
        'type' => 'date'
    ));
    
    woocommerce_wp_text_input(array(
        'id' => '_promotion_end_date',
        'label' => 'Promotion End Date',
        'placeholder' => 'YYYY-MM-DD',
        'desc_tip' => true,
        'description' => 'When the promotion ends (optional)',
        'type' => 'date'
    ));
    
    echo '</div>';
}
add_action('woocommerce_product_options_pricing', 'fitbody_add_dealer_price_field');

/**
 * Save dealer price field
 */
function fitbody_save_dealer_price_field($post_id) {
    $dealer_price = $_POST['_dealer_price'];
    if (!empty($dealer_price)) {
        update_post_meta($post_id, '_dealer_price', esc_attr($dealer_price));
    } else {
        delete_post_meta($post_id, '_dealer_price');
    }
    
    $dealer_only = isset($_POST['_dealer_only']) ? 'yes' : 'no';
    update_post_meta($post_id, '_dealer_only', $dealer_only);
    
    // Save promotion fields
    $is_promotion = isset($_POST['_is_promotion']) ? 'yes' : 'no';
    update_post_meta($post_id, '_is_promotion', $is_promotion);
    
    $promotion_price = $_POST['_promotion_price'];
    if (!empty($promotion_price)) {
        update_post_meta($post_id, '_promotion_price', esc_attr($promotion_price));
    } else {
        delete_post_meta($post_id, '_promotion_price');
    }
    
    $promotion_label = $_POST['_promotion_label'];
    if (!empty($promotion_label)) {
        update_post_meta($post_id, '_promotion_label', sanitize_text_field($promotion_label));
    } else {
        delete_post_meta($post_id, '_promotion_label');
    }
    
    $promotion_start_date = $_POST['_promotion_start_date'];
    if (!empty($promotion_start_date)) {
        update_post_meta($post_id, '_promotion_start_date', sanitize_text_field($promotion_start_date));
    } else {
        delete_post_meta($post_id, '_promotion_start_date');
    }
    
    $promotion_end_date = $_POST['_promotion_end_date'];
    if (!empty($promotion_end_date)) {
        update_post_meta($post_id, '_promotion_end_date', sanitize_text_field($promotion_end_date));
    } else {
        delete_post_meta($post_id, '_promotion_end_date');
    }
}
add_action('woocommerce_process_product_meta', 'fitbody_save_dealer_price_field');

/**
 * Add dealer price field to product variations
 */
function fitbody_add_variation_dealer_price_field($loop, $variation_data, $variation) {
    $dealer_price = get_post_meta($variation->ID, '_dealer_price', true);
    
    woocommerce_wp_text_input(array(
        'id' => '_dealer_price[' . $loop . ']',
        'name' => '_dealer_price[' . $loop . ']',
        'label' => 'Dealer Price',
        'placeholder' => 'Enter dealer price',
        'desc_tip' => true,
        'description' => 'Special price for dealers (optional)',
        'value' => $dealer_price,
        'wrapper_class' => 'form-row form-row-first',
    ));
}
add_action('woocommerce_variation_options_pricing', 'fitbody_add_variation_dealer_price_field', 10, 3);

/**
 * Save dealer price field for product variations
 */
function fitbody_save_variation_dealer_price_field($variation_id, $i) {
    $dealer_price = $_POST['_dealer_price'][$i];
    
    if (!empty($dealer_price)) {
        update_post_meta($variation_id, '_dealer_price', esc_attr($dealer_price));
    } else {
        delete_post_meta($variation_id, '_dealer_price');
    }
}
add_action('woocommerce_save_product_variation', 'fitbody_save_variation_dealer_price_field', 10, 2);

/**
 * Add category fields for home page display and multilingual names
 */
function fitbody_add_category_home_fields($term) {
    $show_on_home = get_term_meta($term->term_id, '_show_on_home', true);
    $home_icon = get_term_meta($term->term_id, '_home_icon', true);
    $home_order = get_term_meta($term->term_id, '_home_order', true);
    
    // Get multilingual names
    $name_en = get_term_meta($term->term_id, '_name_en', true);
    $name_es = get_term_meta($term->term_id, '_name_es', true);
    $name_mk = get_term_meta($term->term_id, '_name_mk', true);
    $name_sq = get_term_meta($term->term_id, '_name_sq', true);
    ?>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="show_on_home">Show on Home Page</label>
        </th>
        <td>
            <input type="checkbox" name="show_on_home" id="show_on_home" value="1" <?php checked($show_on_home, '1'); ?> />
            <p class="description">Check this to display this category on the home page</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="home_icon">Home Page Icon</label>
        </th>
        <td>
            <input type="text" name="home_icon" id="home_icon" value="<?php echo esc_attr($home_icon); ?>" size="40" />
            <p class="description">Enter an emoji or icon for the home page display (e.g., 💪, ⚡, 🌟, 🔥)</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="home_order">Display Order</label>
        </th>
        <td>
            <input type="number" name="home_order" id="home_order" value="<?php echo esc_attr($home_order ?: 0); ?>" min="0" />
            <p class="description">Order in which this category appears on home page (0 = first)</p>
        </td>
    </tr>
    
    <!-- Multilingual Category Names -->
    <tr class="form-field">
        <th scope="row" valign="top" colspan="2">
            <h3 style="margin: 20px 0 10px 0; padding: 10px 0; border-top: 1px solid #ddd;">Multilingual Category Names</h3>
        </th>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="name_en">English Name</label>
        </th>
        <td>
            <input type="text" name="name_en" id="name_en" value="<?php echo esc_attr($name_en); ?>" size="40" />
            <p class="description">Category name in English</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="name_es">Spanish Name</label>
        </th>
        <td>
            <input type="text" name="name_es" id="name_es" value="<?php echo esc_attr($name_es); ?>" size="40" />
            <p class="description">Category name in Spanish (Nombre en español)</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="name_mk">Macedonian Name</label>
        </th>
        <td>
            <input type="text" name="name_mk" id="name_mk" value="<?php echo esc_attr($name_mk); ?>" size="40" />
            <p class="description">Category name in Macedonian (Име на македонски)</p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row" valign="top">
            <label for="name_sq">Albanian Name</label>
        </th>
        <td>
            <input type="text" name="name_sq" id="name_sq" value="<?php echo esc_attr($name_sq); ?>" size="40" />
            <p class="description">Category name in Albanian (Emri në shqip)</p>
        </td>
    </tr>
    <?php
}
add_action('product_cat_edit_form_fields', 'fitbody_add_category_home_fields');

/**
 * Add category fields for new categories
 */
function fitbody_add_category_home_fields_new() {
    ?>
    <div class="form-field">
        <label for="show_on_home">Show on Home Page</label>
        <input type="checkbox" name="show_on_home" id="show_on_home" value="1" />
        <p>Check this to display this category on the home page</p>
    </div>
    <div class="form-field">
        <label for="home_icon">Home Page Icon</label>
        <input type="text" name="home_icon" id="home_icon" value="" size="40" />
        <p>Enter an emoji or icon for the home page display (e.g., 💪, ⚡, 🌟, 🔥)</p>
    </div>
    <div class="form-field">
        <label for="home_order">Display Order</label>
        <input type="number" name="home_order" id="home_order" value="0" min="0" />
        <p>Order in which this category appears on home page (0 = first)</p>
    </div>
    
    <!-- Multilingual Category Names -->
    <h3 style="margin: 20px 0 10px 0; padding: 10px 0; border-top: 1px solid #ddd;">Multilingual Category Names</h3>
    <div class="form-field">
        <label for="name_en">English Name</label>
        <input type="text" name="name_en" id="name_en" value="" size="40" />
        <p>Category name in English</p>
    </div>
    <div class="form-field">
        <label for="name_es">Spanish Name</label>
        <input type="text" name="name_es" id="name_es" value="" size="40" />
        <p>Category name in Spanish (Nombre en español)</p>
    </div>
    <div class="form-field">
        <label for="name_mk">Macedonian Name</label>
        <input type="text" name="name_mk" id="name_mk" value="" size="40" />
        <p>Category name in Macedonian (Име на македонски)</p>
    </div>
    <div class="form-field">
        <label for="name_sq">Albanian Name</label>
        <input type="text" name="name_sq" id="name_sq" value="" size="40" />
        <p>Category name in Albanian (Emri në shqip)</p>
    </div>
    <?php
}
add_action('product_cat_add_form_fields', 'fitbody_add_category_home_fields_new');

/**
 * Save category home page fields and multilingual names
 */
function fitbody_save_category_home_fields($term_id) {
    if (isset($_POST['show_on_home'])) {
        update_term_meta($term_id, '_show_on_home', '1');
    } else {
        update_term_meta($term_id, '_show_on_home', '0');
    }
    
    if (isset($_POST['home_icon'])) {
        update_term_meta($term_id, '_home_icon', sanitize_text_field($_POST['home_icon']));
    }
    
    if (isset($_POST['home_order'])) {
        update_term_meta($term_id, '_home_order', intval($_POST['home_order']));
    }
    
    // Save multilingual names
    if (isset($_POST['name_en'])) {
        update_term_meta($term_id, '_name_en', sanitize_text_field($_POST['name_en']));
    }
    
    if (isset($_POST['name_es'])) {
        update_term_meta($term_id, '_name_es', sanitize_text_field($_POST['name_es']));
    }
    
    if (isset($_POST['name_mk'])) {
        update_term_meta($term_id, '_name_mk', sanitize_text_field($_POST['name_mk']));
    }
    
    if (isset($_POST['name_sq'])) {
        update_term_meta($term_id, '_name_sq', sanitize_text_field($_POST['name_sq']));
    }
}
add_action('edited_product_cat', 'fitbody_save_category_home_fields');
add_action('created_product_cat', 'fitbody_save_category_home_fields');

/**
 * Get translated category name based on language
 */
function fitbody_get_category_name($category, $language = 'en') {
    // Get the multilingual name for the specified language
    $translated_name = get_term_meta($category->term_id, '_name_' . $language, true);
    
    // If no translation exists, fall back to the default category name
    if (empty($translated_name)) {
        return $category->name;
    }
    
    return $translated_name;
}

/**
 * Get all available translations for a category
 */
function fitbody_get_category_translations($category) {
    $translations = [
        'en' => get_term_meta($category->term_id, '_name_en', true) ?: $category->name,
        'es' => get_term_meta($category->term_id, '_name_es', true) ?: $category->name,
        'mk' => get_term_meta($category->term_id, '_name_mk', true) ?: $category->name,
        'sq' => get_term_meta($category->term_id, '_name_sq', true) ?: $category->name,
    ];
    
    return $translations;
}

/**
 * Format category for API response with multilingual support
 */
function fitbody_format_category_for_api($term, $language = 'en') {
    return [
        'id' => $term->term_id,
        'name' => fitbody_get_category_name($term, $language),
        'slug' => $term->slug,
        'translations' => fitbody_get_category_translations($term),
    ];
}
function fitbody_register_dealer_endpoints() {
    register_rest_route('fitbody/v1', '/dealer/register', [
        'methods' => 'POST',
        'callback' => 'fitbody_handle_dealer_registration',
        'permission_callback' => '__return_true',
    ]);
    
    register_rest_route('fitbody/v1', '/dealer/products', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_dealer_products',
        'permission_callback' => 'fitbody_check_dealer_permission',
    ]);
    
    register_rest_route('fitbody/v1', '/dealer/orders', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_dealer_orders',
        'permission_callback' => 'fitbody_check_dealer_permission',
    ]);
    
    register_rest_route('fitbody/v1', '/dealer/profile', [
        'methods' => 'PUT',
        'callback' => 'fitbody_update_dealer_profile',
        'permission_callback' => 'fitbody_check_dealer_permission',
    ]);
    
    register_rest_route('fitbody/v1', '/dealer/forgot-password', [
        'methods' => 'POST',
        'callback' => 'fitbody_dealer_forgot_password',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_dealer_endpoints');

/**
 * Handle dealer registration
 */
function fitbody_handle_dealer_registration($request) {
    $data = $request->get_json_params();
    
    // Validate required fields
    $required_fields = ['firstName', 'lastName', 'email', 'phone', 'company', 'address', 'city', 'businessType'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            return new WP_Error('missing_field', "Field {$field} is required", ['status' => 400]);
        }
    }
    
    // Check if email already exists
    if (email_exists($data['email'])) {
        return new WP_Error('email_exists', 'Email already registered', ['status' => 400]);
    }
    
    // Create user account
    $username = sanitize_user($data['email']);
    $password = wp_generate_password();
    
    $user_id = wp_create_user($username, $password, $data['email']);
    
    if (is_wp_error($user_id)) {
        return $user_id;
    }
    
    // Update user meta
    wp_update_user([
        'ID' => $user_id,
        'first_name' => sanitize_text_field($data['firstName']),
        'last_name' => sanitize_text_field($data['lastName']),
        'display_name' => sanitize_text_field($data['firstName'] . ' ' . $data['lastName'])
    ]);
    
    // Add dealer meta
    update_user_meta($user_id, 'is_dealer', '1');
    update_user_meta($user_id, 'dealer_status', 'pending');
    update_user_meta($user_id, 'dealer_company', sanitize_text_field($data['company']));
    update_user_meta($user_id, 'dealer_business_type', sanitize_text_field($data['businessType']));
    update_user_meta($user_id, 'dealer_phone', sanitize_text_field($data['phone']));
    update_user_meta($user_id, 'dealer_address', sanitize_text_field($data['address']));
    update_user_meta($user_id, 'dealer_city', sanitize_text_field($data['city']));
    update_user_meta($user_id, 'dealer_postal_code', sanitize_text_field($data['postalCode'] ?? ''));
    update_user_meta($user_id, 'dealer_tax_number', sanitize_text_field($data['taxNumber'] ?? ''));
    update_user_meta($user_id, 'dealer_experience', sanitize_text_field($data['experience'] ?? ''));
    update_user_meta($user_id, 'dealer_message', sanitize_textarea_field($data['message'] ?? ''));
    
    // Send notification email to admin
    $admin_email = get_option('admin_email');
    $subject = 'New Dealer Registration - ' . $data['company'];
    $message = "New dealer registration:\n\n";
    $message .= "Name: " . $data['firstName'] . ' ' . $data['lastName'] . "\n";
    $message .= "Email: " . $data['email'] . "\n";
    $message .= "Company: " . $data['company'] . "\n";
    $message .= "Business Type: " . $data['businessType'] . "\n";
    $message .= "Phone: " . $data['phone'] . "\n";
    $message .= "Address: " . $data['address'] . ', ' . $data['city'] . "\n\n";
    $message .= "Please review and approve in WordPress admin.";
    
    wp_mail($admin_email, $subject, $message);
    
    // Send welcome email to dealer
    $dealer_subject = 'Dealer Application Received - FitBody.mk';
    $dealer_message = "Dear " . $data['firstName'] . ",\n\n";
    $dealer_message .= "Thank you for your interest in becoming a FitBody.mk dealer.\n\n";
    $dealer_message .= "We have received your application and will review it shortly.\n";
    $dealer_message .= "You will receive an email notification once your application is processed.\n\n";
    $dealer_message .= "Your temporary login credentials:\n";
    $dealer_message .= "Username: " . $username . "\n";
    $dealer_message .= "Password: " . $password . "\n\n";
    $dealer_message .= "Best regards,\nFitBody.mk Team";
    
    wp_mail($data['email'], $dealer_subject, $dealer_message);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Dealer registration successful',
        'user_id' => $user_id
    ]);
}

/**
 * Check dealer permission - allow access but provide different data based on auth status
 */
function fitbody_check_dealer_permission($request) {
    // Always allow access - we'll handle dealer-specific logic in the callback
    return true;
}

/**
 * Get dealer products (including dealer-only products)
 */
function fitbody_get_dealer_products($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Try to authenticate user
    fitbody_authenticate_rest_user();
    $user = wp_get_current_user();
    $is_authenticated_dealer = false;
    
    if ($user && $user->ID > 0) {
        $is_dealer = get_user_meta($user->ID, 'is_dealer', true);
        $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
        $is_authenticated_dealer = ($is_dealer === '1' && $dealer_status === 'approved');
    }

    // Get parameters from request
    $page = $request->get_param('page') ?: 1;
    $per_page = $request->get_param('per_page') ?: 12;
    $search = $request->get_param('search');
    $category = $request->get_param('category');
    $dealer_only = $request->get_param('dealer_only');

    // Build query args
    $args = [
        'status' => 'publish',
        'limit' => $per_page,
        'offset' => ($page - 1) * $per_page,
    ];

    if ($search) {
        $args['s'] = $search;
    }

    if ($category) {
        // Convert category parameter to proper format for wc_get_products
        $category_ids = explode(',', $category);
        $category_ids = array_map('intval', $category_ids); // Ensure integers
        $category_ids = array_filter($category_ids); // Remove empty values
        
        if (!empty($category_ids)) {
            // Use tax_query for compatibility
            $args['tax_query'] = [
                [
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $category_ids,
                    'operator' => 'IN',
                ]
            ];
        }
    }

    // Get products
    $products = wc_get_products($args);
    $total_products = wc_get_products(array_merge($args, ['limit' => -1, 'offset' => 0]));
    $total = count($total_products);

    // Format products for API response
    $formatted_products = [];
    foreach ($products as $product) {
        $dealer_price = get_post_meta($product->get_id(), '_dealer_price', true);
        $is_dealer_only = get_post_meta($product->get_id(), '_dealer_only', true) === 'yes';
        
        // For dealer products endpoint, show products based on authentication status
        if (!$is_authenticated_dealer && $is_dealer_only) {
            continue; // Skip dealer-only products for non-authenticated users
        }
        
        // If specifically requesting dealer-only products, filter accordingly
        if ($dealer_only === 'true' && !$is_dealer_only) {
            continue; // Skip non-dealer products when specifically requesting dealer-only
        }
        
        $product_data = [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => urldecode($product->get_slug()), // Decode URL-encoded slugs
            'description' => wpautop($product->get_description()),
            'short_description' => wpautop($product->get_short_description()),
            'price' => $product->get_price(),
            'regular_price' => $product->get_regular_price(),
            'sale_price' => $product->get_sale_price(),
            'dealer_price' => $dealer_price ?: null,
            'is_dealer_only' => $is_dealer_only,
            'stock_status' => $product->get_stock_status(),
            'stock_quantity' => $product->get_stock_quantity(),
            'type' => $product->get_type(),
            'images' => array_map(function($image_id) {
                return [
                    'id' => $image_id,
                    'src' => wp_get_attachment_url($image_id),
                    'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                ];
            }, $product->get_gallery_image_ids()),
            'categories' => array_map(function($term) {
                return [
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];
            }, get_the_terms($product->get_id(), 'product_cat') ?: []),
        ];

        // Add main product image if exists
        $main_image_id = $product->get_image_id();
        if ($main_image_id) {
            array_unshift($product_data['images'], [
                'id' => $main_image_id,
                'src' => wp_get_attachment_url($main_image_id),
                'alt' => get_post_meta($main_image_id, '_wp_attachment_image_alt', true),
            ]);
        }

        $formatted_products[] = $product_data;
    }

    // Create response with headers
    $response = rest_ensure_response($formatted_products);
    $response->header('X-WP-Total', $total);
    $response->header('X-WP-TotalPages', ceil($total / $per_page));

    return $response;
}

/**
 * Simple Authentication Endpoints (Alternative to JWT)
 */
function fitbody_register_auth_endpoints() {
    // Simple login endpoint
    register_rest_route('fitbody/v1', '/auth/login', [
        'methods' => 'POST',
        'callback' => 'fitbody_simple_login',
        'permission_callback' => '__return_true',
    ]);
    
    // Get current user endpoint
    register_rest_route('fitbody/v1', '/auth/me', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_current_user',
        'permission_callback' => '__return_true',
    ]);
    
    // Logout endpoint
    register_rest_route('fitbody/v1', '/auth/logout', [
        'methods' => 'POST',
        'callback' => 'fitbody_simple_logout',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_auth_endpoints');

/**
 * Simple login function
 */
function fitbody_simple_login($request) {
    $data = $request->get_json_params();
    
    if (empty($data['username']) || empty($data['password'])) {
        return new WP_Error('missing_credentials', 'Username and password are required', ['status' => 400]);
    }
    
    $user = wp_authenticate($data['username'], $data['password']);
    
    if (is_wp_error($user)) {
        return new WP_Error('invalid_credentials', 'Invalid username or password', ['status' => 401]);
    }
    
    // Create session
    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID, true);
    
    // Set session cookie for API requests
    $session_token = wp_generate_password(32, false);
    set_transient('fitbody_session_' . $session_token, $user->ID, 24 * HOUR_IN_SECONDS);
    
    // Set cookie for frontend
    setcookie('fitbody_session', $session_token, time() + (24 * HOUR_IN_SECONDS), '/', '', true, true);
    
    // Get user meta
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
    $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
    $dealer_company = get_user_meta($user->ID, 'dealer_company', true);
    $dealer_business_type = get_user_meta($user->ID, 'dealer_business_type', true);
    $dealer_phone = get_user_meta($user->ID, 'dealer_phone', true);
    $dealer_address = get_user_meta($user->ID, 'dealer_address', true);
    $dealer_city = get_user_meta($user->ID, 'dealer_city', true);
    $dealer_postal_code = get_user_meta($user->ID, 'dealer_postal_code', true);
    $dealer_tax_number = get_user_meta($user->ID, 'dealer_tax_number', true);
    
    return rest_ensure_response([
        'success' => true,
        'token' => $session_token,
        'user' => [
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'display_name' => $user->display_name,
            'roles' => $user->roles,
            'is_dealer' => $is_dealer,
            'dealer_status' => $dealer_status,
            'dealer_company' => $dealer_company,
            'dealer_business_type' => $dealer_business_type,
            'dealer_phone' => $dealer_phone,
            'dealer_address' => $dealer_address,
            'dealer_city' => $dealer_city,
            'dealer_postal_code' => $dealer_postal_code,
            'dealer_tax_number' => $dealer_tax_number,
        ]
    ]);
}

/**
 * Get current user
 */
function fitbody_get_current_user($request) {
    // Ensure authentication is called
    fitbody_authenticate_rest_user();
    
    $user = wp_get_current_user();
    
    if (!$user || $user->ID === 0) {
        return new WP_Error('not_logged_in', 'User not logged in', ['status' => 401]);
    }
    
    // Get user meta
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
    $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
    $dealer_company = get_user_meta($user->ID, 'dealer_company', true);
    $dealer_business_type = get_user_meta($user->ID, 'dealer_business_type', true);
    $dealer_phone = get_user_meta($user->ID, 'dealer_phone', true);
    $dealer_address = get_user_meta($user->ID, 'dealer_address', true);
    $dealer_city = get_user_meta($user->ID, 'dealer_city', true);
    $dealer_postal_code = get_user_meta($user->ID, 'dealer_postal_code', true);
    $dealer_tax_number = get_user_meta($user->ID, 'dealer_tax_number', true);
    
    return rest_ensure_response([
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'display_name' => $user->display_name,
        'roles' => $user->roles,
        'is_dealer' => $is_dealer,
        'dealer_status' => $dealer_status,
        'dealer_company' => $dealer_company,
        'dealer_business_type' => $dealer_business_type,
        'dealer_phone' => $dealer_phone,
        'dealer_address' => $dealer_address,
        'dealer_city' => $dealer_city,
        'dealer_postal_code' => $dealer_postal_code,
        'dealer_tax_number' => $dealer_tax_number,
    ]);
}

/**
 * Simple logout
 */
function fitbody_simple_logout($request) {
    // Get session token and remove it
    $session_token = null;
    
    if (isset($_COOKIE['fitbody_session'])) {
        $session_token = $_COOKIE['fitbody_session'];
        delete_transient('fitbody_session_' . $session_token);
        setcookie('fitbody_session', '', time() - 3600, '/');
    }
    
    wp_logout();
    return rest_ensure_response(['success' => true, 'message' => 'Logged out successfully']);
}

/**
 * Debug categories endpoint
 */
function fitbody_debug_categories($request) {
    if (!function_exists('wc_get_products')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    $category_id = $request->get_param('category_id');
    
    // Get all categories
    $categories = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ]);
    
    $debug_info = [
        'total_categories' => count($categories),
        'categories' => array_map(function($cat) {
            return [
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->count,
            ];
        }, array_slice($categories, 0, 10)), // Show first 10 categories
    ];
    
    // Test category filtering if category_id is provided
    if ($category_id) {
        $category_id = intval($category_id);
        
        // Test different approaches
        $test_results = [];
        
        // Test 1: Using tax_query
        $args1 = [
            'status' => 'publish',
            'limit' => 5,
            'tax_query' => [
                [
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => [$category_id],
                    'operator' => 'IN',
                ]
            ],
        ];
        $products1 = wc_get_products($args1);
        $test_results['tax_query'] = count($products1);
        
        // Test 2: Using category parameter
        $args2 = [
            'status' => 'publish',
            'limit' => 5,
            'category' => [$category_id],
        ];
        $products2 = wc_get_products($args2);
        $test_results['category_param'] = count($products2);
        
        // Test 3: Get all products and check their categories
        $all_products = wc_get_products(['status' => 'publish', 'limit' => 100]);
        $matching_products = 0;
        foreach ($all_products as $product) {
            $product_categories = get_the_terms($product->get_id(), 'product_cat');
            if ($product_categories) {
                foreach ($product_categories as $cat) {
                    if ($cat->term_id == $category_id) {
                        $matching_products++;
                        break;
                    }
                }
            }
        }
        $test_results['manual_check'] = $matching_products;
        
        $debug_info['category_test'] = [
            'tested_category_id' => $category_id,
            'results' => $test_results,
        ];
    }
    
    // Get total products
    $all_products = wc_get_products(['status' => 'publish', 'limit' => -1]);
    $debug_info['total_products'] = count($all_products);
    
    return rest_ensure_response($debug_info);
}

/**
 * Debug cart status
 */
function fitbody_debug_cart($request) {
    if (!function_exists('WC')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    // Initialize WooCommerce
    fitbody_init_woocommerce_for_api();

    $cart = WC()->cart;
    
    $debug_info = [
        'cart_exists' => !is_null($cart),
        'cart_empty' => $cart ? $cart->is_empty() : true,
        'cart_contents_count' => $cart ? $cart->get_cart_contents_count() : 0,
        'cart_total' => $cart ? $cart->get_total() : '0',
        'session_exists' => !is_null(WC()->session),
        'session_id' => WC()->session ? WC()->session->get_customer_id() : 'none',
        'cart_contents' => $cart ? $cart->get_cart() : [],
    ];
    
    return rest_ensure_response($debug_info);
}

/**
 * Get dealer orders
 */
function fitbody_get_dealer_orders($request) {
    if (!function_exists('wc_get_orders')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', ['status' => 500]);
    }

    $user = wp_get_current_user();
    if (!$user || $user->ID === 0) {
        return new WP_Error('not_logged_in', 'User not logged in', ['status' => 401]);
    }

    error_log('Getting orders for user ID: ' . $user->ID);

    // Get parameters from request
    $page = $request->get_param('page') ?: 1;
    $per_page = $request->get_param('per_page') ?: 10;
    $status = $request->get_param('status');

    // Build query args
    $args = [
        'customer_id' => $user->ID,
        'limit' => $per_page,
        'offset' => ($page - 1) * $per_page,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    if ($status) {
        $args['status'] = $status;
    }

    error_log('Order query args: ' . print_r($args, true));

    // Get orders
    $orders = wc_get_orders($args);
    error_log('Found ' . count($orders) . ' orders for user ' . $user->ID);
    
    // Also try to get all orders for debugging
    $all_orders = wc_get_orders(['limit' => 10, 'orderby' => 'date', 'order' => 'DESC']);
    error_log('Total recent orders in system: ' . count($all_orders));
    foreach ($all_orders as $debug_order) {
        error_log('Order ' . $debug_order->get_id() . ' customer ID: ' . $debug_order->get_customer_id());
    }
    
    $total_orders = wc_get_orders(array_merge($args, ['limit' => -1, 'offset' => 0]));
    $total = count($total_orders);

    // Format orders for API response
    $formatted_orders = [];
    foreach ($orders as $order) {
        $order_data = [
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'billing' => [
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
                'address_1' => $order->get_billing_address_1(),
                'city' => $order->get_billing_city(),
                'postcode' => $order->get_billing_postcode(),
            ],
            'items' => [],
        ];

        // Add order items
        foreach ($order->get_items() as $item_id => $item) {
            $product = $item->get_product();
            $order_data['items'][] = [
                'id' => $item->get_product_id(),
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'price' => $item->get_total() / $item->get_quantity(),
                'total' => $item->get_total(),
                'image' => $product ? [
                    'id' => $product->get_image_id(),
                    'src' => wp_get_attachment_url($product->get_image_id()),
                    'alt' => get_post_meta($product->get_image_id(), '_wp_attachment_image_alt', true),
                ] : null,
            ];
        }

        $formatted_orders[] = $order_data;
    }

    // Create response with headers
    $response = rest_ensure_response($formatted_orders);
    $response->header('X-WP-Total', $total);
    $response->header('X-WP-TotalPages', ceil($total / $per_page));

    return $response;
}

/**
 * Store dealer info with orders
 */
function fitbody_store_dealer_info_with_order($order_id, $posted_data, $order) {
    $user = wp_get_current_user();
    if ($user && $user->ID > 0) {
        $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
        $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
        
        if ($is_dealer && $dealer_status === 'approved') {
            update_post_meta($order_id, '_is_dealer_order', 'yes');
            update_post_meta($order_id, '_dealer_id', $user->ID);
            update_post_meta($order_id, '_dealer_company', get_user_meta($user->ID, 'dealer_company', true));
            update_post_meta($order_id, '_dealer_business_type', get_user_meta($user->ID, 'dealer_business_type', true));
        }
    }
}
add_action('woocommerce_checkout_order_processed', 'fitbody_store_dealer_info_with_order', 10, 3);

/**
 * Apply dealer pricing to order items
 */
function fitbody_apply_dealer_pricing_to_order($order_id) {
    $user = wp_get_current_user();
    if (!$user || $user->ID === 0) {
        return;
    }
    
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
    $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
    
    if (!$is_dealer || $dealer_status !== 'approved') {
        return;
    }
    
    $order = wc_get_order($order_id);
    if (!$order) {
        return;
    }
    
    // Update order items with dealer pricing
    foreach ($order->get_items() as $item_id => $item) {
        $product_id = $item->get_product_id();
        $dealer_price = get_post_meta($product_id, '_dealer_price', true);
        
        if ($dealer_price) {
            $quantity = $item->get_quantity();
            $item->set_subtotal($dealer_price * $quantity);
            $item->set_total($dealer_price * $quantity);
            $item->save();
        }
    }
    
    // Recalculate order totals
    $order->calculate_totals();
    $order->save();
}
add_action('woocommerce_checkout_order_processed', 'fitbody_apply_dealer_pricing_to_order', 20);
/**
 * Update dealer profile
 */
function fitbody_update_dealer_profile($request) {
    $user = wp_get_current_user();
    if (!$user || $user->ID === 0) {
        return new WP_Error('not_logged_in', 'User not logged in', ['status' => 401]);
    }

    $data = $request->get_json_params();
    
    if (!$data) {
        return new WP_Error('missing_data', 'Profile data is required', ['status' => 400]);
    }

    try {
        // Update user basic info
        $user_data = [
            'ID' => $user->ID,
        ];
        
        if (isset($data['first_name'])) {
            $user_data['first_name'] = sanitize_text_field($data['first_name']);
        }
        
        if (isset($data['last_name'])) {
            $user_data['last_name'] = sanitize_text_field($data['last_name']);
        }
        
        if (isset($data['email'])) {
            $email = sanitize_email($data['email']);
            if (is_email($email)) {
                // Check if email is already taken by another user
                $existing_user = get_user_by('email', $email);
                if ($existing_user && $existing_user->ID !== $user->ID) {
                    return new WP_Error('email_exists', 'Email already exists', ['status' => 400]);
                }
                $user_data['user_email'] = $email;
            }
        }
        
        // Update user data
        $result = wp_update_user($user_data);
        if (is_wp_error($result)) {
            return new WP_Error('update_failed', 'Failed to update user data: ' . $result->get_error_message(), ['status' => 500]);
        }
        
        // Update dealer meta fields
        if (isset($data['phone'])) {
            update_user_meta($user->ID, 'dealer_phone', sanitize_text_field($data['phone']));
        }
        
        if (isset($data['company'])) {
            update_user_meta($user->ID, 'dealer_company', sanitize_text_field($data['company']));
        }
        
        if (isset($data['business_type'])) {
            update_user_meta($user->ID, 'dealer_business_type', sanitize_text_field($data['business_type']));
        }
        
        if (isset($data['address'])) {
            update_user_meta($user->ID, 'dealer_address', sanitize_text_field($data['address']));
        }
        
        if (isset($data['city'])) {
            update_user_meta($user->ID, 'dealer_city', sanitize_text_field($data['city']));
        }
        
        if (isset($data['postal_code'])) {
            update_user_meta($user->ID, 'dealer_postal_code', sanitize_text_field($data['postal_code']));
        }
        
        if (isset($data['tax_number'])) {
            update_user_meta($user->ID, 'dealer_tax_number', sanitize_text_field($data['tax_number']));
        }
        
        // Get updated user data
        $updated_user = get_user_by('ID', $user->ID);
        $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
        $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
        $dealer_company = get_user_meta($user->ID, 'dealer_company', true);
        $dealer_business_type = get_user_meta($user->ID, 'dealer_business_type', true);
        $dealer_phone = get_user_meta($user->ID, 'dealer_phone', true);
        $dealer_address = get_user_meta($user->ID, 'dealer_address', true);
        $dealer_city = get_user_meta($user->ID, 'dealer_city', true);
        $dealer_postal_code = get_user_meta($user->ID, 'dealer_postal_code', true);
        $dealer_tax_number = get_user_meta($user->ID, 'dealer_tax_number', true);
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $updated_user->ID,
                'username' => $updated_user->user_login,
                'email' => $updated_user->user_email,
                'first_name' => $updated_user->first_name,
                'last_name' => $updated_user->last_name,
                'display_name' => $updated_user->display_name,
                'roles' => $updated_user->roles,
                'is_dealer' => $is_dealer,
                'dealer_status' => $dealer_status,
                'dealer_company' => $dealer_company,
                'dealer_business_type' => $dealer_business_type,
                'dealer_phone' => $dealer_phone,
                'dealer_address' => $dealer_address,
                'dealer_city' => $dealer_city,
                'dealer_postal_code' => $dealer_postal_code,
                'dealer_tax_number' => $dealer_tax_number,
            ]
        ]);
        
    } catch (Exception $e) {
        error_log('Profile update exception: ' . $e->getMessage());
        return new WP_Error('update_error', $e->getMessage(), ['status' => 500]);
    }
}

/**
 * Handle dealer forgot password
 */
function fitbody_dealer_forgot_password($request) {
    $email = $request->get_param('email');
    
    if (empty($email)) {
        return new WP_Error('missing_email', 'Email е задолжителен', ['status' => 400]);
    }
    
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Невалиден email формат', ['status' => 400]);
    }
    
    // Find user by email
    $user = get_user_by('email', $email);
    
    if (!$user) {
        return new WP_Error('user_not_found', 'Корисникот не е пронајден', ['status' => 404]);
    }
    
    // Check if user is a dealer
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true);
    if ($is_dealer !== '1') {
        return new WP_Error('not_dealer', 'Корисникот не е дилер', ['status' => 403]);
    }
    
    // Generate password reset key
    $reset_key = get_password_reset_key($user);
    
    if (is_wp_error($reset_key)) {
        return new WP_Error('reset_key_error', 'Грешка при генерирање на клуч за ресетирање', ['status' => 500]);
    }
    
    // Create reset URL
    $reset_url = network_site_url("wp-login.php?action=rp&key=$reset_key&login=" . rawurlencode($user->user_login), 'login');
    
    // Send email
    $subject = 'Ресетирање на лозинка - FitBody.mk';
    $message = "Здраво " . $user->display_name . ",\n\n";
    $message .= "Добивте барање за ресетирање на лозинката за вашиот дилерски профил на FitBody.mk.\n\n";
    $message .= "За да ја ресетирате лозинката, кликнете на следниот линк:\n";
    $message .= $reset_url . "\n\n";
    $message .= "Ако не сте барале ресетирање на лозинката, игнорирајте го овој email.\n\n";
    $message .= "Линкот е валиден 24 часа.\n\n";
    $message .= "Поздрав,\nFitBody.mk тим";
    
    $headers = ['Content-Type: text/plain; charset=UTF-8'];
    
    $sent = wp_mail($email, $subject, $message, $headers);
    
    if (!$sent) {
        return new WP_Error('email_failed', 'Грешка при испраќanje на email', ['status' => 500]);
    }
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Email за ресетирање на лозинка е испратен'
    ]);
}

/**
 * Global dealer pricing hooks for cart
 */

// Hook to modify cart item prices for dealers
add_filter('woocommerce_before_calculate_totals', 'fitbody_apply_dealer_pricing_to_cart', 10, 1);

function fitbody_apply_dealer_pricing_to_cart($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    // Check if user is dealer
    $user = wp_get_current_user();
    
    // Debug logging
    error_log('Dealer pricing hook triggered - User ID: ' . ($user ? $user->ID : 'none'));
    
    if (!$user || $user->ID === 0) {
        error_log('No user found, skipping dealer pricing');
        return;
    }
    
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
    $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
    
    error_log('User ' . $user->ID . ' - is_dealer: ' . ($is_dealer ? 'yes' : 'no') . ', status: ' . $dealer_status);
    
    if (!$is_dealer || $dealer_status !== 'approved') {
        error_log('User is not approved dealer, applying promotion pricing if applicable');
        // Apply promotion pricing for regular users
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $product_id = $cart_item['product_id'];
            
            // Check for promotion pricing
            $is_promotion = get_post_meta($product_id, '_is_promotion', true) === 'yes';
            $promotion_price = get_post_meta($product_id, '_promotion_price', true);
            $promotion_start_date = get_post_meta($product_id, '_promotion_start_date', true);
            $promotion_end_date = get_post_meta($product_id, '_promotion_end_date', true);
            
            // Check if promotion is currently active
            $promotion_active = false;
            if ($is_promotion && $promotion_price) {
                $current_date = current_time('Y-m-d');
                $promotion_active = true;
                
                if ($promotion_start_date && $current_date < $promotion_start_date) {
                    $promotion_active = false;
                }
                
                if ($promotion_end_date && $current_date > $promotion_end_date) {
                    $promotion_active = false;
                }
            }
            
            if ($promotion_active && $promotion_price > 0) {
                // Set the promotion price
                $cart_item['data']->set_price($promotion_price);
                error_log('Applied promotion price ' . $promotion_price . ' to product ' . $product_id);
            }
        }
        return;
    }

    error_log('Applying dealer pricing for approved dealer');
    
    // Loop through cart items and apply dealer pricing
    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        $product_id = $cart_item['product_id'];
        $dealer_price = get_post_meta($product_id, '_dealer_price', true);
        
        error_log('Product ' . $product_id . ' - dealer_price: ' . ($dealer_price ?: 'none'));
        
        if ($dealer_price && $dealer_price > 0) {
            // Set the custom price
            $cart_item['data']->set_price($dealer_price);
            error_log('Applied dealer price ' . $dealer_price . ' to product ' . $product_id);
        }
    }
}

// Hook to add dealer price info to cart item data
add_filter('woocommerce_add_cart_item_data', 'fitbody_add_dealer_price_to_cart_item', 10, 3);

function fitbody_add_dealer_price_to_cart_item($cart_item_data, $product_id, $variation_id) {
    // Check if user is dealer
    $user = wp_get_current_user();
    if (!$user || $user->ID === 0) {
        // Check for promotion pricing for regular users
        $is_promotion = get_post_meta($product_id, '_is_promotion', true) === 'yes';
        $promotion_price = get_post_meta($product_id, '_promotion_price', true);
        $promotion_start_date = get_post_meta($product_id, '_promotion_start_date', true);
        $promotion_end_date = get_post_meta($product_id, '_promotion_end_date', true);
        
        // Check if promotion is currently active
        $promotion_active = false;
        if ($is_promotion && $promotion_price) {
            $current_date = current_time('Y-m-d');
            $promotion_active = true;
            
            if ($promotion_start_date && $current_date < $promotion_start_date) {
                $promotion_active = false;
            }
            
            if ($promotion_end_date && $current_date > $promotion_end_date) {
                $promotion_active = false;
            }
        }
        
        if ($promotion_active && $promotion_price > 0) {
            $cart_item_data['promotion_price'] = $promotion_price;
            $cart_item_data['is_promotion_item'] = true;
        }
        
        return $cart_item_data;
    }
    
    $is_dealer = get_user_meta($user->ID, 'is_dealer', true) === '1';
    $dealer_status = get_user_meta($user->ID, 'dealer_status', true);
    
    if ($is_dealer && $dealer_status === 'approved') {
        $dealer_price = get_post_meta($product_id, '_dealer_price', true);
        if ($dealer_price && $dealer_price > 0) {
            $cart_item_data['dealer_price'] = $dealer_price;
            $cart_item_data['is_dealer_item'] = true;
        }
    }
    
    return $cart_item_data;
}

// Hook to apply dealer pricing when cart item is loaded from session
add_filter('woocommerce_get_cart_item_from_session', 'fitbody_get_dealer_cart_item_from_session', 10, 3);

function fitbody_get_dealer_cart_item_from_session($item, $values, $key) {
    if (isset($values['dealer_price']) && isset($values['is_dealer_item'])) {
        $item['data']->set_price($values['dealer_price']);
    } elseif (isset($values['promotion_price']) && isset($values['is_promotion_item'])) {
        $item['data']->set_price($values['promotion_price']);
    }
    return $item;
}
/**
 * Debug endpoint for dealer pricing
 */
function fitbody_register_debug_dealer_endpoint() {
    register_rest_route('fitbody/v1', '/debug/dealer', [
        'methods'  => 'GET',
        'callback' => function () {
            $user = wp_get_current_user();
            $debug_info = [
                'user_logged_in' => $user && $user->ID > 0,
                'user_id' => $user ? $user->ID : 0,
                'is_dealer' => false,
                'dealer_status' => 'none',
                'cart_items' => [],
                'session_exists' => !is_null(WC()->session),
            ];
            
            if ($user && $user->ID > 0) {
                $debug_info['is_dealer'] = get_user_meta($user->ID, 'is_dealer', true) === '1';
                $debug_info['dealer_status'] = get_user_meta($user->ID, 'dealer_status', true);
            }
            
            // Initialize WooCommerce
            fitbody_init_woocommerce_for_api();
            
            if (WC()->cart) {
                foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
                    $product_id = $cart_item['product_id'];
                    $product = $cart_item['data'];
                    $dealer_price = get_post_meta($product_id, '_dealer_price', true);
                    
                    $debug_info['cart_items'][] = [
                        'key' => $cart_item_key,
                        'product_id' => $product_id,
                        'product_name' => $product->get_name(),
                        'regular_price' => $product->get_regular_price(),
                        'current_price' => $product->get_price(),
                        'dealer_price_meta' => $dealer_price,
                        'quantity' => $cart_item['quantity'],
                        'has_dealer_data' => isset($cart_item['dealer_price']),
                        'dealer_data' => isset($cart_item['dealer_price']) ? $cart_item['dealer_price'] : null,
                    ];
                }
            }
            
            return rest_ensure_response($debug_info);
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_debug_dealer_endpoint');
/**
 * Debug endpoint for authentication status
 */
function fitbody_register_debug_auth_endpoint() {
    register_rest_route('fitbody/v1', '/debug/auth', [
        'methods'  => 'GET',
        'callback' => function () {
            // Ensure authentication is called
            fitbody_authenticate_rest_user();
            
            $user = wp_get_current_user();
            $session_token = null;
            
            // Try to get from cookie first
            if (isset($_COOKIE['fitbody_session'])) {
                $session_token = $_COOKIE['fitbody_session'];
            }
            
            // Try to get from Authorization header
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $auth_header = $headers['Authorization'];
                if (strpos($auth_header, 'Bearer ') === 0) {
                    $session_token = substr($auth_header, 7);
                }
            }
            
            $debug_info = [
                'user_logged_in' => $user && $user->ID > 0,
                'user_id' => $user ? $user->ID : 0,
                'user_email' => $user ? $user->user_email : null,
                'session_token_present' => !empty($session_token),
                'session_token_valid' => false,
                'is_dealer' => false,
                'dealer_status' => 'none',
                'cookies' => $_COOKIE,
                'headers' => $headers,
            ];
            
            if ($session_token) {
                $user_id_from_session = get_transient('fitbody_session_' . $session_token);
                $debug_info['session_token_valid'] = !empty($user_id_from_session);
                $debug_info['session_user_id'] = $user_id_from_session;
            }
            
            if ($user && $user->ID > 0) {
                $debug_info['is_dealer'] = get_user_meta($user->ID, 'is_dealer', true) === '1';
                $debug_info['dealer_status'] = get_user_meta($user->ID, 'dealer_status', true);
            }
            
            return rest_ensure_response($debug_info);
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_debug_auth_endpoint');
/**
 * Custom authentication filter for session tokens
 */
function fitbody_custom_authentication($user, $username, $password) {
    // If user is already authenticated, return it
    if ($user instanceof WP_User) {
        return $user;
    }
    
    // Check for session token authentication
    $session_token = null;
    
    if (isset($_COOKIE['fitbody_session'])) {
        $session_token = $_COOKIE['fitbody_session'];
    }
    
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            $session_token = substr($auth_header, 7);
        }
    }
    
    if ($session_token) {
        $user_id = get_transient('fitbody_session_' . $session_token);
        if ($user_id) {
            $user = get_user_by('ID', $user_id);
            if ($user) {
                return $user;
            }
        }
    }
    
    return $user;
}
add_filter('authenticate', 'fitbody_custom_authentication', 30, 3);

/**
 * Determine current user for REST API requests
 */
function fitbody_determine_current_user($user_id) {
    // If user is already determined, return it
    if ($user_id) {
        return $user_id;
    }
    
    // Only for REST API requests
    if (!defined('REST_REQUEST') || !REST_REQUEST) {
        return $user_id;
    }
    
    // Check for session token
    $session_token = null;
    
    if (isset($_COOKIE['fitbody_session'])) {
        $session_token = $_COOKIE['fitbody_session'];
    }
    
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (strpos($auth_header, 'Bearer ') === 0) {
            $session_token = substr($auth_header, 7);
        }
    }
    
    if ($session_token) {
        $user_id_from_session = get_transient('fitbody_session_' . $session_token);
        if ($user_id_from_session) {
            return $user_id_from_session;
        }
    }
    
    return $user_id;
}
add_filter('determine_current_user', 'fitbody_determine_current_user', 20);
/**
 * Simple test endpoint to verify authentication
 */
function fitbody_register_auth_test_endpoint() {
    register_rest_route('fitbody/v1', '/test/auth', [
        'methods'  => 'GET',
        'callback' => function () {
            $user = wp_get_current_user();
            
            return rest_ensure_response([
                'authenticated' => is_user_logged_in(),
                'user_id' => $user ? $user->ID : 0,
                'user_email' => $user ? $user->user_email : null,
                'is_dealer' => $user && $user->ID > 0 ? (get_user_meta($user->ID, 'is_dealer', true) === '1') : false,
                'dealer_status' => $user && $user->ID > 0 ? get_user_meta($user->ID, 'dealer_status', true) : 'none',
                'timestamp' => current_time('mysql'),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'fitbody_register_auth_test_endpoint');

/**
 * Shipping Cost Calculation Functions
 */

/**
 * Calculate shipping cost for cart
 */
function fitbody_calculate_shipping_cost($subtotal) {
    if ($subtotal < 3000) {
        return 150;
    }
    return 0;
}

/**
 * Get shipping info for cart
 */
function fitbody_get_shipping_info($subtotal) {
    $cost = fitbody_calculate_shipping_cost($subtotal);
    
    return [
        'cost' => $cost,
        'label' => $cost > 0 ? 'Стандардна достава' : 'Бесплатна достава',
        'description' => $cost > 0 ? 
            'Достава 150 ден. Бесплатна достава за нарачки над 3.000 ден.' : 
            'Бесплатна достава за нарачки над 3.000 ден.'
    ];
}

/**
 * Add shipping info to cart API response
 */
add_action('rest_api_init', function() {
    register_rest_route('fitbody/v1', '/cart/shipping', [
        'methods' => 'GET',
        'callback' => 'fitbody_get_cart_shipping',
        'permission_callback' => '__return_true'
    ]);
});

function fitbody_get_cart_shipping($request) {
    try {
        // Initialize WooCommerce if needed
        if (!function_exists('WC')) {
            // If WooCommerce is not available, return default shipping for empty cart
            $shipping_info = fitbody_get_shipping_info(0);
            return rest_ensure_response([
                'subtotal' => 0,
                'shipping' => $shipping_info,
                'total' => 0 + $shipping_info['cost'],
                'debug' => 'WooCommerce not available'
            ]);
        }

        // Initialize cart session
        if (!WC()->session) {
            WC()->session = new WC_Session_Handler();
            WC()->session->init();
        }

        // Initialize cart
        if (!WC()->cart) {
            WC()->cart = new WC_Cart();
        }

        // Load cart from session
        WC()->cart->get_cart_from_session();
        
        $cart = WC()->cart;
        
        // Get subtotal, try multiple methods
        $subtotal = 0;
        $debug_info = [];
        
        if ($cart && !$cart->is_empty()) {
            // Try different methods to get subtotal
            $subtotal_methods = [
                'get_subtotal' => $cart->get_subtotal(),
                'get_cart_subtotal' => $cart->get_cart_subtotal(),
                'subtotal' => $cart->subtotal ?? 0,
                'cart_contents_total' => $cart->cart_contents_total ?? 0
            ];
            
            $debug_info['subtotal_methods'] = $subtotal_methods;
            
            // Use the highest non-zero value
            foreach ($subtotal_methods as $method => $value) {
                $numeric_value = floatval($value);
                if ($numeric_value > $subtotal) {
                    $subtotal = $numeric_value;
                    $debug_info['used_method'] = $method;
                }
            }
            
            $debug_info['cart_contents_count'] = $cart->get_cart_contents_count();
            $debug_info['cart_total'] = $cart->get_total('');
        } else {
            $debug_info['cart_status'] = 'empty or null';
        }
        
        // Ensure subtotal is numeric
        if (!$subtotal || $subtotal < 0) {
            $subtotal = 0;
        }
        
        $shipping_info = fitbody_get_shipping_info($subtotal);
        
        return rest_ensure_response([
            'subtotal' => floatval($subtotal),
            'shipping' => $shipping_info,
            'total' => floatval($subtotal) + $shipping_info['cost'],
            'debug' => $debug_info
        ]);
        
    } catch (Exception $e) {
        error_log('Cart shipping calculation error: ' . $e->getMessage());
        
        // Return default shipping info instead of error
        $shipping_info = fitbody_get_shipping_info(0);
        return rest_ensure_response([
            'subtotal' => 0,
            'shipping' => $shipping_info,
            'total' => 0 + $shipping_info['cost'],
            'error' => 'Exception: ' . $e->getMessage()
        ]);
    }
}

/**
 * WhatsApp Notification System for New Orders
 */

/**
 * Send Telegram notification for new order - Multi-Admin Support
 */
function fitbody_send_whatsapp_order_notification($order_id) {
    try {
        error_log('=== TELEGRAM ORDER NOTIFICATION DEBUG ===');
        error_log('Order ID: ' . $order_id);
        
        $order = wc_get_order($order_id);
        if (!$order) {
            error_log('Telegram notification failed: Order not found - ' . $order_id);
            return false;
        }

        // Get Telegram settings
        $telegram_enabled = get_option('fitbody_telegram_enabled', false);
        $telegram_bot_token = get_option('fitbody_telegram_bot_token', '');
        
        // Get all admin chat IDs (main + additional admins)
        $main_chat_id = get_option('fitbody_telegram_chat_id', '');
        $additional_admins = get_option('fitbody_telegram_admin_ids', array());
        
        // Combine all admin chat IDs
        $all_admin_ids = array();
        if (!empty($main_chat_id)) {
            $all_admin_ids[] = $main_chat_id;
        }
        if (is_array($additional_admins)) {
            $all_admin_ids = array_merge($all_admin_ids, $additional_admins);
        }
        
        // Remove duplicates
        $all_admin_ids = array_unique(array_filter($all_admin_ids));

        error_log('Telegram enabled: ' . ($telegram_enabled ? 'YES' : 'NO'));
        error_log('Bot token configured: ' . (!empty($telegram_bot_token) ? 'YES' : 'NO'));
        error_log('Admin chat IDs: ' . implode(', ', $all_admin_ids));

        if (!$telegram_enabled) {
            error_log('Telegram notification skipped: Not enabled');
            return false;
        }

        if (empty($telegram_bot_token) || empty($all_admin_ids)) {
            error_log('Telegram notification skipped: Missing bot token or admin chat IDs');
            return false;
        }

        // Format the message
        $message = fitbody_format_telegram_order_message($order);
        error_log('Message formatted, length: ' . strlen($message));
        
        // Send to all admin chat IDs
        $success_count = 0;
        foreach ($all_admin_ids as $chat_id) {
            error_log('Sending to admin chat ID: ' . $chat_id);
            if (fitbody_send_telegram_to_chat($telegram_bot_token, $chat_id, $message)) {
                $success_count++;
            }
        }
        
        error_log("Telegram notifications sent to {$success_count} out of " . count($all_admin_ids) . " admins");
        return $success_count > 0;

    } catch (Exception $e) {
        error_log('Telegram notification error: ' . $e->getMessage());
        return false;
    }
}

/**
 * Format Telegram message for order
 */
function fitbody_format_telegram_order_message($order) {
    $message = "🛒 <b>НОВА НАРАЧКА - FitBody.mk</b>\n\n";
    
    // Order details
    $message .= "📋 <b>Детали за нарачката:</b>\n";
    $message .= "Број: #" . $order->get_order_number() . "\n";
    $message .= "Датум: " . $order->get_date_created()->format('d.m.Y H:i') . "\n\n";
    
    // Customer details
    $message .= "👤 <b>Купувач:</b>\n";
    $message .= "Име: " . $order->get_billing_first_name() . " " . $order->get_billing_last_name() . "\n";
    $message .= "Телефон: " . $order->get_billing_phone() . "\n";
    
    if ($order->get_billing_email()) {
        $message .= "Емаил: " . $order->get_billing_email() . "\n";
    }
    
    $message .= "\n📍 <b>Адреса за достава:</b>\n";
    $message .= $order->get_billing_address_1() . "\n";
    $message .= $order->get_billing_city();
    
    if ($order->get_billing_postcode()) {
        $message .= ", " . $order->get_billing_postcode();
    }
    $message .= "\n\n";
    
    // Order items
    $message .= "🛍️ <b>Производи:</b>\n";
    foreach ($order->get_items() as $item) {
        $product_name = $item->get_name();
        $quantity = $item->get_quantity();
        $total = $item->get_total();
        
        // Add variation details if available
        $variation_text = '';
        if ($item->get_variation_id()) {
            $variation_data = $item->get_meta_data();
            $variations = [];
            foreach ($variation_data as $meta) {
                $key = $meta->key;
                $value = $meta->value;
                // Skip internal meta keys
                if (strpos($key, '_') !== 0 && !empty($value)) {
                    $variations[] = $value;
                }
            }
            if (!empty($variations)) {
                $variation_text = ' (' . implode(', ', $variations) . ')';
            }
        }
        
        $message .= "• {$product_name}{$variation_text} x{$quantity} - " . number_format($total, 0) . " ден\n";
    }
    
    // Shipping
    foreach ($order->get_items('shipping') as $shipping_item) {
        $shipping_method = $shipping_item->get_method_title();
        $shipping_cost = $shipping_item->get_total();
        
        if ($shipping_cost > 0) {
            $message .= "• {$shipping_method} - " . number_format($shipping_cost, 0) . " ден\n";
        } else {
            $message .= "• {$shipping_method} - Бесплатна\n";
        }
    }
    
    $message .= "\n💰 <b>Вкупно: " . number_format($order->get_total(), 0) . " ден</b>\n";
    $message .= "💳 Плаќање: " . $order->get_payment_method_title() . "\n\n";
    
    // Order notes
    if ($order->get_customer_note()) {
        $message .= "📝 <b>Забелешки:</b>\n";
        $message .= $order->get_customer_note() . "\n\n";
    }
    
    $message .= "🌐 Администрација: https://api.fitbody.mk/wp-admin/post.php?post=" . $order->get_id() . "&action=edit";
    
    return $message;
}

/**
 * Send Telegram message (for contact form - uses main chat ID)
 */
function fitbody_send_telegram_message($message) {
    // Use FitBody's Telegram settings (same as order notifications)
    $bot_token = get_option('fitbody_telegram_bot_token', '');
    $chat_id = get_option('fitbody_telegram_chat_id', '');
    
    if (empty($bot_token) || empty($chat_id)) {
        error_log('Telegram credentials not configured. Contact form will only send email.');
        return false;
    }
    
    return fitbody_send_telegram_to_chat($bot_token, $chat_id, $message);
}

/**
 * Send Telegram message to specific chat (for order notifications - multiple admins)
 */
function fitbody_send_telegram_to_chat($bot_token, $chat_id, $message) {
    $url = "https://api.telegram.org/bot{$bot_token}/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true
    ];
    
    $response = wp_remote_post($url, [
        'body' => $data,
        'timeout' => 15
    ]);
    
    if (is_wp_error($response)) {
        error_log('Telegram API error: ' . $response->get_error_message());
        return false;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    
    if ($response_code === 200) {
        $result = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($result['ok']) && $result['ok'] === true) {
            return true;
        }
    }
    
    error_log('Telegram send failed with code: ' . $response_code);
    return false;
}


/**
 * Hook into order creation to send Telegram notification
 */
add_action('woocommerce_new_order', 'fitbody_send_whatsapp_order_notification', 10, 1);

/**
 * Add Telegram settings to WordPress admin
 */
add_action('admin_menu', function() {
    add_options_page(
        'Telegram Notifications',
        'Telegram Notifications',
        'manage_options',
        'fitbody-telegram',
        'fitbody_telegram_settings_page'
    );
    
    // Add submenu for admin management
    add_submenu_page(
        'options-general.php',
        'Telegram Админи',
        'Telegram Админи', 
        'manage_options',
        'telegram-admins',
        'fitbody_telegram_admin_management_page'
    );
});

/**
 * Telegram Admin Management Page
 */
function fitbody_telegram_admin_management_page() {
    // Handle adding new admin
    if (isset($_POST['add_admin_id']) && wp_verify_nonce($_POST['_wpnonce'], 'add_admin_nonce')) {
        $new_id = sanitize_text_field($_POST['new_admin_chat_id']);
        if ($new_id && is_numeric($new_id)) {
            $admin_ids = get_option('fitbody_telegram_admin_ids', array());
            if (!in_array($new_id, $admin_ids)) {
                $admin_ids[] = $new_id;
                update_option('fitbody_telegram_admin_ids', $admin_ids);
                echo '<div class="notice notice-success"><p>✅ Admin chat ID додаден успешно!</p></div>';
            } else {
                echo '<div class="notice notice-warning"><p>⚠️ Овој chat ID веќе постои!</p></div>';
            }
        } else {
            echo '<div class="notice notice-error"><p>❌ Невалиден chat ID! Мора да биде број.</p></div>';
        }
    }
    
    // Handle removing admin
    if (isset($_POST['remove_admin_id']) && wp_verify_nonce($_POST['_wpnonce'], 'remove_admin_nonce')) {
        $remove_id = sanitize_text_field($_POST['remove_id']);
        $admin_ids = get_option('fitbody_telegram_admin_ids', array());
        $admin_ids = array_diff($admin_ids, array($remove_id));
        update_option('fitbody_telegram_admin_ids', array_values($admin_ids));
        echo '<div class="notice notice-success"><p>✅ Admin chat ID отстранет!</p></div>';
    }
    
    // Get current admins
    $main_admin = get_option('fitbody_telegram_chat_id', '');
    $additional_admins = get_option('fitbody_telegram_admin_ids', array());
    $bot_username = get_option('fitbody_telegram_bot_username', 'your_bot_name');
    ?>
    <div class="wrap">
        <h1>📱 Telegram Admin Управување</h1>
        
        <div class="card" style="max-width: 800px;">
            <h2>👥 Тековни Админи</h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width: 200px;">Chat ID</th>
                        <th style="width: 100px;">Тип</th>
                        <th>Акции</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($main_admin): ?>
                    <tr>
                        <td><code><?php echo esc_html($main_admin); ?></code></td>
                        <td><span class="dashicons dashicons-admin-users"></span> Главен</td>
                        <td><em>Главниот админ не може да се отстрани</em></td>
                    </tr>
                    <?php endif; ?>
                    
                    <?php foreach ($additional_admins as $chat_id): ?>
                    <tr>
                        <td><code><?php echo esc_html($chat_id); ?></code></td>
                        <td><span class="dashicons dashicons-admin-generic"></span> Додатен</td>
                        <td>
                            <form method="post" style="display: inline;">
                                <?php wp_nonce_field('remove_admin_nonce'); ?>
                                <input type="hidden" name="remove_id" value="<?php echo esc_attr($chat_id); ?>">
                                <button type="submit" name="remove_admin_id" class="button button-secondary" 
                                        onclick="return confirm('Сигурни сте дека сакате да го отстраните овој админ?')">
                                    🗑️ Отстрани
                                </button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                    
                    <?php if (empty($main_admin) && empty($additional_admins)): ?>
                    <tr>
                        <td colspan="3" style="text-align: center; color: #666;">
                            <em>Нема конфигурирани админи</em>
                        </td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>➕ Додај Нов Админ</h2>
            <form method="post">
                <?php wp_nonce_field('add_admin_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="new_admin_chat_id">Chat ID</label>
                        </th>
                        <td>
                            <input type="text" id="new_admin_chat_id" name="new_admin_chat_id" 
                                   placeholder="123456789" class="regular-text" required>
                            <p class="description">
                                <strong>Како да го најдете Chat ID:</strong><br>
                                1. Пратете му линк: <code>https://t.me/<?php echo esc_html($bot_username); ?>?start=admin</code><br>
                                2. Тој треба да кликне "START" во ботот<br>
                                3. Пратете го на: <a href="https://t.me/userinfobot" target="_blank">@userinfobot</a><br>
                                4. Тој праќа било која порака до @userinfobot<br>
                                5. Ботот ќе му го врати неговиот Chat ID
                            </p>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" name="add_admin_id" class="button-primary" value="➕ Додај Админ">
                </p>
            </form>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px; background: #f0f8ff; border-left: 4px solid #0073aa;">
            <h2>📋 Инструкции за додавање админ</h2>
            <ol>
                <li><strong>Пратете линк:</strong> <code>https://t.me/<?php echo esc_html($bot_username); ?>?start=admin</code></li>
                <li><strong>Тој стартува бот:</strong> Кликнува "START" кога ќе отвори линкот</li>
                <li><strong>Најдете Chat ID:</strong> Користете @userinfobot или проверете логови</li>
                <li><strong>Додајте тука:</strong> Внесете го Chat ID и кликнете "Додај Админ"</li>
            </ol>
            
            <h3>🔒 Безбедност</h3>
            <p>
                <span class="dashicons dashicons-shield-alt" style="color: green;"></span>
                Секој админ ќе добива известувања за сите нарачки, но нема да може да ги види пораките на другите корисници.
                Секој разговор со ботот е приватен.
            </p>
        </div>
    </div>
    
    <style>
    .card { padding: 20px; background: white; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04); }
    .card h2 { margin-top: 0; }
    code { background: #f1f1f1; padding: 2px 4px; border-radius: 3px; }
    </style>
    <?php
}

/**
 * Telegram settings page (simplified)
 */
function fitbody_telegram_settings_page() {
    // Handle test message
    if (isset($_POST['test_telegram']) && wp_verify_nonce($_POST['_wpnonce'], 'test_telegram_nonce')) {
        $test_message = "🧪 <b>TEST MESSAGE - FitBody.mk</b>\n\n";
        $test_message .= "✅ Telegram notifications are working!\n";
        $test_message .= "📅 Test time: " . current_time('d.m.Y H:i') . "\n\n";
        $test_message .= "🛒 You will receive order notifications like this when customers place orders.";
        
        $bot_token = get_option('fitbody_telegram_bot_token', '');
        $chat_id = get_option('fitbody_telegram_chat_id', '');
        
        if (!empty($bot_token) && !empty($chat_id)) {
            $result = fitbody_send_telegram_message($bot_token, $chat_id, $test_message);
            
            if ($result) {
                echo '<div class="notice notice-success"><p>✅ Test message sent! Check your Telegram.</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>❌ Test message failed. Check error logs or verify your bot token and chat ID.</p></div>';
            }
        } else {
            echo '<div class="notice notice-error"><p>❌ Please configure bot token and chat ID first.</p></div>';
        }
    }

    if (isset($_POST['submit'])) {
        // Debug: Log what we're receiving
        error_log('=== TELEGRAM SETTINGS SAVE DEBUG ===');
        error_log('POST telegram_bot_token: ' . ($_POST['telegram_bot_token'] ?? 'NOT SET'));
        error_log('POST telegram_chat_id: ' . ($_POST['telegram_chat_id'] ?? 'NOT SET'));
        
        // Save simplified settings
        update_option('fitbody_telegram_enabled', isset($_POST['telegram_enabled']));
        
        // Telegram settings
        $telegram_token = sanitize_text_field($_POST['telegram_bot_token'] ?? '');
        $telegram_chat_id = sanitize_text_field($_POST['telegram_chat_id'] ?? '');
        
        update_option('fitbody_telegram_bot_token', $telegram_token);
        update_option('fitbody_telegram_chat_id', $telegram_chat_id);
        
        error_log('Saved telegram_enabled: ' . (isset($_POST['telegram_enabled']) ? 'YES' : 'NO'));
        error_log('Saved telegram_bot_token: ' . $telegram_token);
        error_log('Saved telegram_chat_id: ' . $telegram_chat_id);
        
        echo '<div class="notice notice-success"><p>✅ Settings saved! Check error logs for debug info.</p></div>';
    }
    
    $telegram_enabled = get_option('fitbody_telegram_enabled', false);
    $telegram_bot_token = get_option('fitbody_telegram_bot_token', '');
    $telegram_chat_id = get_option('fitbody_telegram_chat_id', '');
    
    ?>
    <div class="wrap">
        <h1>📱 Telegram Order Notifications</h1>
        <p>Get instant notifications on your phone when customers place orders - completely FREE!</p>
        
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Enable Telegram Notifications</th>
                    <td>
                        <input type="checkbox" name="telegram_enabled" value="1" <?php checked($telegram_enabled, 1); ?> />
                        <label>Send Telegram notifications for new orders</label>
                    </td>
                </tr>
            </table>
            
            <h2>📱 Telegram Settings (FREE & RECOMMENDED)</h2>
            <div class="card" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px;">
                <h3 style="margin-top: 0;">🎯 Quick Setup (2 minutes):</h3>
                <ol>
                    <li><strong>Create Bot:</strong> Message @BotFather on Telegram → type <code>/newbot</code></li>
                    <li><strong>Get Token:</strong> Copy the token (like: 123456789:ABCdef...)</li>
                    <li><strong>Get Chat ID:</strong> Message @userinfobot → copy your Chat ID</li>
                    <li><strong>Test Bot:</strong> Search for your bot and start chat</li>
                    <li><strong>Configure below</strong> and save settings</li>
                </ol>
                <p><strong>✅ Result:</strong> Customer places order → Telegram message appears on your phone instantly!</p>
            </div>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Telegram Bot Token</th>
                    <td>
                        <input type="text" name="telegram_bot_token" value="<?php echo esc_attr($telegram_bot_token); ?>" class="regular-text" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" />
                        <p class="description">Get from @BotFather on Telegram (create new bot)</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Your Telegram Chat ID</th>
                    <td>
                        <input type="text" name="telegram_chat_id" value="<?php echo esc_attr($telegram_chat_id); ?>" class="regular-text" placeholder="123456789" />
                        <p class="description">Get from @userinfobot on Telegram (send any message to get your ID)</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
        
        <?php if (!empty($telegram_bot_token) && !empty($telegram_chat_id)): ?>
        <div class="card" style="background: #f0f0f0; padding: 15px; margin: 20px 0;">
            <h4>🧪 Test Your Setup:</h4>
            <p>Send a test message to verify your Telegram configuration is working.</p>
            
            <form method="post" style="margin-top: 15px;">
                <input type="hidden" name="test_telegram" value="1">
                <?php wp_nonce_field('test_telegram_nonce'); ?>
                <button type="submit" class="button button-secondary">📱 Send Test Message</button>
            </form>
        </div>
        <?php endif; ?>
        
        <div class="card" style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🆓 Completely FREE!</h3>
            <ul>
                <li>✅ No monthly fees</li>
                <li>✅ No message limits</li>
                <li>✅ No setup costs</li>
                <li>✅ Instant notifications</li>
                <li>✅ Works on all devices</li>
            </ul>
        </div>
        
        <h2>📋 Setup Instructions</h2>
        <div class="card">
            <h3>Step 1: Create Telegram Bot</h3>
            <ol>
                <li>Open Telegram on your phone</li>
                <li>Search for <strong>@BotFather</strong></li>
                <li>Start chat with BotFather</li>
                <li>Type: <code>/newbot</code></li>
                <li>Bot Name: <code>FitBody Order Bot</code> (or any name you like)</li>
                <li>Bot Username: <code>fitbody_orders_bot</code> (must end with <code>_bot</code>)</li>
                <li>Copy the Token (looks like: <code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code>)</li>
            </ol>
            
            <h3>Step 2: Get Your Chat ID</h3>
            <ol>
                <li>Search for <strong>@userinfobot</strong></li>
                <li>Start chat and send any message</li>
                <li>Copy your Chat ID (looks like: <code>123456789</code>)</li>
            </ol>
            
            <h3>Step 3: Test Your Bot</h3>
            <ol>
                <li>Search for your bot (<code>@fitbody_orders_bot</code>) in Telegram</li>
                <li>Start chat with your bot</li>
                <li>Send message: "Hello" (to activate the chat)</li>
            </ol>
            
            <h3>Step 4: Configure & Test</h3>
            <ol>
                <li>Fill in the Bot Token and Chat ID above</li>
                <li>Enable notifications and save settings</li>
                <li>Use the "Send Test Message" button to verify</li>
                <li>Place a test order to confirm notifications work</li>
            </ol>
        </div>
    </div>
    <?php
}
/**
 * Remove old WhatsApp dashboard widget and replace with simple Telegram status
 */
add_action('wp_dashboard_setup', function() {
    wp_add_dashboard_widget(
        'fitbody_telegram_status',
        '📱 Telegram Order Notifications',
        'fitbody_telegram_dashboard_widget'
    );
});

/**
 * Simple Telegram status dashboard widget
 */
function fitbody_telegram_dashboard_widget() {
    $telegram_enabled = get_option('fitbody_telegram_enabled', false);
    $telegram_bot_token = get_option('fitbody_telegram_bot_token', '');
    $telegram_chat_id = get_option('fitbody_telegram_chat_id', '');
    
    if (!$telegram_enabled) {
        echo '<p>❌ Telegram notifications are disabled.</p>';
        echo '<p><a href="' . admin_url('options-general.php?page=fitbody-telegram') . '" class="button">⚙️ Enable Notifications</a></p>';
        return;
    }
    
    if (empty($telegram_bot_token) || empty($telegram_chat_id)) {
        echo '<p>⚠️ Telegram notifications are enabled but not configured.</p>';
        echo '<p><a href="' . admin_url('options-general.php?page=fitbody-telegram') . '" class="button">⚙️ Configure Settings</a></p>';
        return;
    }
    
    echo '<p>✅ Telegram notifications are active and configured.</p>';
    echo '<p>🤖 Bot Token: ' . substr($telegram_bot_token, 0, 10) . '...</p>';
    echo '<p>👤 Chat ID: ' . $telegram_chat_id . '</p>';
    echo '<p><a href="' . admin_url('options-general.php?page=fitbody-telegram') . '" class="button">⚙️ Settings</a></p>';
}

/**
 * Multi-Language Support for WooCommerce Products
 * Adds support for product descriptions and short descriptions in multiple languages
 */

/**
 * Add multi-language fields to product admin
 */
function fitbody_add_multilang_product_fields() {
    global $post;
    
    if (!$post || $post->post_type !== 'product') {
        return;
    }
    
    $languages = [
        'en' => 'English',
        'es' => 'Spanish', 
        'sq' => 'Albanian'
    ];
    
    echo '<div class="options_group">';
    echo '<h3>' . __('Multi-Language Content', 'woocommerce') . '</h3>';
    
    foreach ($languages as $lang_code => $lang_name) {
        echo '<div class="fitbody-translation-field" data-lang="' . $lang_code . '" style="display: none;">';
        echo '<h4 style="margin: 20px 0 10px 0; color: #0073aa;">' . $lang_name . ' Translation</h4>';
        
        // Title field
        $title_key = '_title_' . $lang_code;
        $title_value = get_post_meta($post->ID, $title_key, true);
        
        echo '<p class="form-field">';
        echo '<label for="' . $title_key . '"><strong>' . $lang_name . ' Title</strong></label>';
        echo '<input type="text" id="' . $title_key . '" name="' . $title_key . '" value="' . esc_attr($title_value) . '" style="width: 100%;" placeholder="Enter ' . $lang_name . ' title..." />';
        echo '</p>';
        
        // Description field
        $description_key = '_description_' . $lang_code;
        $description_value = get_post_meta($post->ID, $description_key, true);
        
        echo '<p class="form-field">';
        echo '<label for="' . $description_key . '"><strong>' . $lang_name . ' Description</strong></label>';
        wp_editor($description_value, $description_key, [
            'textarea_name' => $description_key,
            'textarea_rows' => 8,
            'media_buttons' => false,
            'teeny' => true,
            'tinymce' => [
                'toolbar1' => 'bold,italic,underline,link,unlink,bullist,numlist',
                'toolbar2' => '',
            ],
        ]);
        echo '</p>';
        
        // Short description field
        $short_description_key = '_short_description_' . $lang_code;
        $short_description_value = get_post_meta($post->ID, $short_description_key, true);
        
        echo '<p class="form-field">';
        echo '<label for="' . $short_description_key . '"><strong>' . $lang_name . ' Short Description</strong></label>';
        echo '<textarea id="' . $short_description_key . '" name="' . $short_description_key . '" rows="4" style="width: 100%;" placeholder="Enter ' . $lang_name . ' short description...">' . esc_textarea($short_description_value) . '</textarea>';
        echo '</p>';
        
        echo '</div>'; // Close translation field div
    }
    
    echo '</div>';
}
add_action('woocommerce_product_options_general_product_data', 'fitbody_add_multilang_product_fields');

/**
 * Save multi-language product fields
 */
function fitbody_save_multilang_product_fields($post_id) {
    $languages = ['en', 'es', 'sq'];
    
    foreach ($languages as $lang_code) {
        // Save title
        $title_key = '_title_' . $lang_code;
        if (isset($_POST[$title_key])) {
            $title_value = sanitize_text_field($_POST[$title_key]);
            update_post_meta($post_id, $title_key, $title_value);
        }
        
        // Save description
        $description_key = '_description_' . $lang_code;
        if (isset($_POST[$description_key])) {
            $description_value = wp_kses_post($_POST[$description_key]);
            update_post_meta($post_id, $description_key, $description_value);
        }
        
        // Save short description
        $short_description_key = '_short_description_' . $lang_code;
        if (isset($_POST[$short_description_key])) {
            $short_description_value = sanitize_textarea_field($_POST[$short_description_key]);
            update_post_meta($post_id, $short_description_key, $short_description_value);
        }
    }
}
add_action('woocommerce_process_product_meta', 'fitbody_save_multilang_product_fields');

/**
 * Get product title in specified language
 */
function fitbody_get_product_title($product_id, $language = 'mk') {
    if ($language === 'mk') {
        // Return default Macedonian title
        $product = wc_get_product($product_id);
        return $product ? $product->get_name() : '';
    }
    
    // Get translated title
    $title_key = '_title_' . $language;
    $translated_title = get_post_meta($product_id, $title_key, true);
    
    // Fallback to Macedonian if translation doesn't exist
    if (empty($translated_title)) {
        $product = wc_get_product($product_id);
        return $product ? $product->get_name() : '';
    }
    
    return $translated_title;
}

/**
 * Get product description in specified language
 */
function fitbody_get_product_description($product_id, $language = 'mk') {
    if ($language === 'mk') {
        // Return default Macedonian description
        $product = wc_get_product($product_id);
        return $product ? $product->get_description() : '';
    }
    
    // Get translated description
    $description_key = '_description_' . $language;
    $translated_description = get_post_meta($product_id, $description_key, true);
    
    // Fallback to Macedonian if translation doesn't exist
    if (empty($translated_description)) {
        $product = wc_get_product($product_id);
        return $product ? $product->get_description() : '';
    }
    
    return $translated_description;
}

/**
 * Get product short description in specified language
 */
function fitbody_get_product_short_description($product_id, $language = 'mk') {
    if ($language === 'mk') {
        // Return default Macedonian short description
        $product = wc_get_product($product_id);
        return $product ? $product->get_short_description() : '';
    }
    
    // Get translated short description
    $short_description_key = '_short_description_' . $language;
    $translated_short_description = get_post_meta($product_id, $short_description_key, true);
    
    // Fallback to Macedonian if translation doesn't exist
    if (empty($translated_short_description)) {
        $product = wc_get_product($product_id);
        return $product ? $product->get_short_description() : '';
    }
    
    return $translated_short_description;
}

/**
 * Add language parameter to product API endpoints
 */
function fitbody_add_language_to_product_data($product_data, $product, $language = null) {
    // If no language specified, try to get from request
    if (!$language) {
        $language = isset($_GET['lang']) ? sanitize_text_field($_GET['lang']) : 'mk';
    }
    
    // Validate language
    $supported_languages = ['mk', 'en', 'es', 'sq'];
    if (!in_array($language, $supported_languages)) {
        $language = 'mk';
    }
    
    // Get title, descriptions in requested language
    $product_data['name'] = fitbody_get_product_title($product->get_id(), $language);
    $product_data['description'] = wpautop(fitbody_get_product_description($product->get_id(), $language));
    $product_data['short_description'] = wpautop(fitbody_get_product_short_description($product->get_id(), $language));
    
    // Add language info to response
    $product_data['language'] = $language;
    $product_data['available_languages'] = [];
    
    // Check which languages have translations
    foreach ($supported_languages as $lang) {
        if ($lang === 'mk') {
            // Macedonian is always available (default)
            $product_data['available_languages'][] = $lang;
        } else {
            // Check if translation exists
            $title_key = '_title_' . $lang;
            $desc_key = '_description_' . $lang;
            $short_desc_key = '_short_description_' . $lang;
            $has_title = !empty(get_post_meta($product->get_id(), $title_key, true));
            $has_desc = !empty(get_post_meta($product->get_id(), $desc_key, true));
            $has_short_desc = !empty(get_post_meta($product->get_id(), $short_desc_key, true));
            
            if ($has_title || $has_desc || $has_short_desc) {
                $product_data['available_languages'][] = $lang;
            }
        }
    }
    
    return $product_data;
}

/**
 * Update product API endpoints to support multi-language
 */

// Update single product endpoint
function fitbody_proxy_woocommerce_product_multilang($request) {
    $response = fitbody_proxy_woocommerce_product($request);
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    $product_data = $response->get_data();
    $product_id = $request->get_param('id');
    $language = $request->get_param('lang') ?: 'mk';
    $product = wc_get_product($product_id);
    
    if ($product) {
        $product_data = fitbody_add_language_to_product_data($product_data, $product, $language);
    }
    
    return rest_ensure_response($product_data);
}

// Update single product by slug endpoint
function fitbody_proxy_woocommerce_product_by_slug_multilang($request) {
    $response = fitbody_proxy_woocommerce_product_by_slug($request);
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    $product_data = $response->get_data();
    $slug = $request->get_param('slug');
    $language = $request->get_param('lang') ?: 'mk';
    
    // Get product by slug
    $decoded_slug = urldecode($slug);
    $post = get_page_by_path($decoded_slug, OBJECT, 'product');
    if (!$post) {
        $post = get_page_by_path($slug, OBJECT, 'product');
    }
    
    if ($post) {
        $product = wc_get_product($post->ID);
        if ($product) {
            $product_data = fitbody_add_language_to_product_data($product_data, $product, $language);
        }
    }
    
    return rest_ensure_response($product_data);
}

// Update products list endpoint
function fitbody_proxy_woocommerce_products_multilang($request) {
    $response = fitbody_proxy_woocommerce_products($request);
    
    if (is_wp_error($response)) {
        return $response;
    }
    
    $products_data = $response->get_data();
    $language = $request->get_param('lang') ?: 'mk';
    
    // Update each product with language-specific content
    foreach ($products_data as &$product_data) {
        if (isset($product_data['id'])) {
            $product = wc_get_product($product_data['id']);
            if ($product) {
                $product_data = fitbody_add_language_to_product_data($product_data, $product, $language);
            }
        }
    }
    
    // Create new response but preserve the headers from original response
    $new_response = rest_ensure_response($products_data);
    
    // Copy headers from original response
    $headers = $response->get_headers();
    foreach ($headers as $key => $value) {
        $new_response->header($key, $value);
    }
    
    return $new_response;
}

/**
 * Register multi-language API endpoints
 */
function fitbody_register_multilang_api_endpoints() {
    // Single product endpoint with language support
    register_rest_route('fitbody/v1', '/products/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => 'fitbody_proxy_woocommerce_product_multilang',
        'permission_callback' => '__return_true',
        'args' => [
            'lang' => [
                'description' => 'Language code (mk, en, es, sq)',
                'type' => 'string',
                'default' => 'mk',
                'enum' => ['mk', 'en', 'es', 'sq'],
            ],
        ],
    ]);

    // Single product by slug endpoint with language support
    register_rest_route('fitbody/v1', '/products/slug/(?P<slug>[^/]+)', [
        'methods'  => 'GET',
        'callback' => 'fitbody_proxy_woocommerce_product_by_slug_multilang',
        'permission_callback' => '__return_true',
        'args' => [
            'lang' => [
                'description' => 'Language code (mk, en, es, sq)',
                'type' => 'string',
                'default' => 'mk',
                'enum' => ['mk', 'en', 'es', 'sq'],
            ],
        ],
    ]);

    // Products list endpoint with language support
    register_rest_route('fitbody/v1', '/products', [
        'methods'  => 'GET',
        'callback' => 'fitbody_proxy_woocommerce_products_multilang',
        'permission_callback' => '__return_true',
        'args' => [
            'lang' => [
                'description' => 'Language code (mk, en, es, sq)',
                'type' => 'string',
                'default' => 'mk',
                'enum' => ['mk', 'en', 'es', 'sq'],
            ],
        ],
    ]);
}
add_action('rest_api_init', 'fitbody_register_multilang_api_endpoints', 20);

/**
 * Add language switcher to product admin
 */
function fitbody_add_product_language_switcher() {
    global $post;
    
    if (!$post || $post->post_type !== 'product') {
        return;
    }
    
    $languages = [
        'mk' => ['name' => 'Македонски', 'flag' => '🇲🇰'],
        'en' => ['name' => 'English', 'flag' => '🇺🇸'],
        'es' => ['name' => 'Español', 'flag' => '🇪🇸'],
        'sq' => ['name' => 'Shqip', 'flag' => '🇦🇱']
    ];
    
    echo '<div id="fitbody-language-tabs" style="margin: 20px 0; border-bottom: 1px solid #ccc;">';
    echo '<h3>Product Content Languages</h3>';
    echo '<div class="fitbody-lang-tabs">';
    
    foreach ($languages as $code => $lang) {
        $active = $code === 'mk' ? 'active' : '';
        echo '<button type="button" class="fitbody-lang-tab ' . $active . '" data-lang="' . $code . '" style="margin-right: 10px; padding: 8px 12px; border: 1px solid #ccc; background: ' . ($active ? '#0073aa' : '#f1f1f1') . '; color: ' . ($active ? 'white' : 'black') . ';">';
        echo $lang['flag'] . ' ' . $lang['name'];
        echo '</button>';
    }
    
    echo '</div>';
    echo '</div>';
    
    // Add JavaScript for tab switching
    echo '<script>
    jQuery(document).ready(function($) {
        // Hide all translation fields initially
        $(".fitbody-translation-field").hide();
        
        $(".fitbody-lang-tab").click(function() {
            var lang = $(this).data("lang");
            
            // Update tab appearance
            $(".fitbody-lang-tab").removeClass("active").css({
                "background": "#f1f1f1",
                "color": "black"
            });
            $(this).addClass("active").css({
                "background": "#0073aa", 
                "color": "white"
            });
            
            // Show/hide content based on language
            if (lang === "mk") {
                // Show default WordPress fields
                $("#titlediv, #postdivrich, #postexcerpt").show();
                $(".fitbody-translation-field").hide();
            } else {
                // Hide default fields, show only selected language translation fields
                $("#titlediv, #postdivrich, #postexcerpt").hide();
                $(".fitbody-translation-field").hide();
                $(".fitbody-translation-field[data-lang=\"" + lang + "\"]").show();
            }
        });
        
        // Initialize - show Macedonian by default
        $(".fitbody-lang-tab[data-lang=mk]").click();
    });
    </script>';
}
add_action('edit_form_after_title', 'fitbody_add_product_language_switcher');

/**
 * Add CSS for better admin styling
 */
function fitbody_admin_multilang_styles() {
    global $post;
    
    if (!$post || $post->post_type !== 'product') {
        return;
    }
    
    echo '<style>
    .fitbody-lang-tabs {
        margin-bottom: 15px;
    }
    .fitbody-lang-tab {
        cursor: pointer;
        border-radius: 3px 3px 0 0;
        transition: all 0.3s ease;
    }
    .fitbody-lang-tab:hover {
        background: #0073aa !important;
        color: white !important;
    }
    .fitbody-lang-tab.active {
        border-bottom: 1px solid #0073aa;
    }
    .fitbody-translation-field {
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        background: #f9f9f9;
    }
    .fitbody-translation-field h4 {
        margin-top: 0 !important;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
    </style>';
}
add_action('admin_head', 'fitbody_admin_multilang_styles');

/**
 * Helper function to get all available languages for a product
 */
function fitbody_get_product_available_languages($product_id) {
    $languages = ['mk']; // Macedonian is always available
    $lang_codes = ['en', 'es', 'sq'];
    
    foreach ($lang_codes as $lang) {
        $title_key = '_title_' . $lang;
        $desc_key = '_description_' . $lang;
        $short_desc_key = '_short_description_' . $lang;
        $has_title = !empty(get_post_meta($product_id, $title_key, true));
        $has_desc = !empty(get_post_meta($product_id, $desc_key, true));
        $has_short_desc = !empty(get_post_meta($product_id, $short_desc_key, true));
        
        if ($has_title || $has_desc || $has_short_desc) {
            $languages[] = $lang;
        }
    }
    
    return $languages;
}

/**
 * Add language indicator to product list in admin
 */
function fitbody_add_language_column_to_products($columns) {
    $columns['languages'] = 'Languages';
    return $columns;
}
add_filter('manage_edit-product_columns', 'fitbody_add_language_column_to_products');

function fitbody_show_language_column_content($column, $post_id) {
    if ($column === 'languages') {
        $available_languages = fitbody_get_product_available_languages($post_id);
        $flags = [
            'mk' => '🇲🇰',
            'en' => '🇺🇸', 
            'es' => '🇪🇸',
            'sq' => '🇦🇱'
        ];
        
        $output = '';
        foreach ($available_languages as $lang) {
            $output .= isset($flags[$lang]) ? $flags[$lang] . ' ' : '';
        }
        
        echo $output ?: '🇲🇰'; // Default to Macedonian flag if no languages
    }
}
add_action('manage_product_posts_custom_column', 'fitbody_show_language_column_content', 10, 2);

/**
 * Register multilingual blog endpoints
 * IMPORTANT: This must run early to ensure endpoints are available
 */
function fitbody_register_blog_multilang_endpoints() {
    // Ensure we're in the right context
    if (!function_exists('register_rest_route')) {
        error_log('Blog endpoints: register_rest_route not available');
        return;
    }
    
    error_log('Registering blog endpoints...');
    
    // Blog posts endpoint with language support
    register_rest_route('fitbody/v1', '/blog/posts', [
        [
            'methods'  => 'GET',
            'callback' => 'fitbody_get_blog_posts_multilang',
            'permission_callback' => '__return_true',
            'args' => [
                'lang' => [
                    'description' => 'Language code (mk, en, es, sq)',
                    'type' => 'string',
                    'default' => 'mk',
                    'enum' => ['mk', 'en', 'es', 'sq'],
                ],
                'per_page' => [
                    'description' => 'Number of posts per page',
                    'type' => 'integer',
                    'default' => 10,
                ],
                'page' => [
                    'description' => 'Page number',
                    'type' => 'integer',
                    'default' => 1,
                ],
                'search' => [
                    'description' => 'Search term',
                    'type' => 'string',
                ],
                'categories' => [
                    'description' => 'Category IDs',
                    'type' => 'string',
                ],
            ],
        ],
        [
            'methods'  => 'POST',
            'callback' => 'fitbody_create_blog_post_multilang',
            'permission_callback' => 'fitbody_check_blog_post_permissions',
            'args' => [
                'title' => [
                    'description' => 'Post title',
                    'type' => 'string',
                    'required' => true,
                ],
                'content' => [
                    'description' => 'Post content',
                    'type' => 'string',
                    'required' => true,
                ],
                'excerpt' => [
                    'description' => 'Post excerpt',
                    'type' => 'string',
                ],
                'status' => [
                    'description' => 'Post status',
                    'type' => 'string',
                    'default' => 'draft',
                    'enum' => ['draft', 'publish'],
                ],
                'categories' => [
                    'description' => 'Category IDs',
                    'type' => 'array',
                ],
                'tags' => [
                    'description' => 'Tag names',
                    'type' => 'array',
                ],
                'lang' => [
                    'description' => 'Language code (mk, en, es, sq)',
                    'type' => 'string',
                    'default' => 'mk',
                    'enum' => ['mk', 'en', 'es', 'sq'],
                ],
                'translation_group' => [
                    'description' => 'Translation group ID to link posts',
                    'type' => 'string',
                ],
            ],
        ],
    ]);

    // Single blog post endpoint with language support
    register_rest_route('fitbody/v1', '/blog/posts/(?P<slug>[^/]+)', [
        'methods'  => 'GET',
        'callback' => 'fitbody_get_blog_post_by_slug_multilang',
        'permission_callback' => '__return_true',
        'args' => [
            'lang' => [
                'description' => 'Language code (mk, en, es, sq)',
                'type' => 'string',
                'default' => 'mk',
                'enum' => ['mk', 'en', 'es', 'sq'],
            ],
        ],
    ]);

    // Blog categories endpoint with language support
    register_rest_route('fitbody/v1', '/blog/categories', [
        'methods'  => 'GET',
        'callback' => 'fitbody_get_blog_categories_multilang',
        'permission_callback' => '__return_true',
        'args' => [
            'lang' => [
                'description' => 'Language code (mk, en, es, sq)',
                'type' => 'string',
                'default' => 'mk',
                'enum' => ['mk', 'en', 'es', 'sq'],
            ],
        ],
    ]);
}
add_action('rest_api_init', 'fitbody_register_blog_multilang_endpoints', 10);

/**
 * Ensure blog endpoints are registered and permalinks are flushed if needed
 * This runs on theme activation and periodically checks if endpoints are working
 */
function fitbody_ensure_blog_endpoints() {
    // Check if we need to flush permalinks
    $endpoints_flushed = get_option('fitbody_blog_endpoints_flushed', false);
    
    if (!$endpoints_flushed) {
        error_log('Flushing permalinks to register blog endpoints...');
        flush_rewrite_rules();
        update_option('fitbody_blog_endpoints_flushed', true);
    }
}
add_action('after_switch_theme', 'fitbody_ensure_blog_endpoints');
add_action('admin_init', 'fitbody_ensure_blog_endpoints');

/**
 * Reset the flush flag when needed (e.g., after theme update)
 */
function fitbody_reset_endpoints_flag() {
    delete_option('fitbody_blog_endpoints_flushed');
}
register_activation_hook(__FILE__, 'fitbody_reset_endpoints_flag');

/**
 * Get blog posts with multilingual support
 */
function fitbody_get_blog_posts_multilang($request) {
    error_log('Blog posts endpoint called');
    
    $lang = $request->get_param('lang') ?: 'mk';
    $per_page = $request->get_param('per_page') ?: 10;
    $page = $request->get_param('page') ?: 1;
    $search = $request->get_param('search');
    $categories = $request->get_param('categories');
    
    error_log('Blog posts params: lang=' . $lang . ', per_page=' . $per_page . ', page=' . $page . ', search=' . $search . ', categories=' . $categories);

    $args = [
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $per_page,
        'paged' => $page,
    ];

    if ($search) {
        $args['s'] = $search;
    }

    if ($categories) {
        $category_ids = explode(',', $categories);
        $category_ids = array_map('intval', $category_ids);
        $category_ids = array_filter($category_ids);
        
        if (!empty($category_ids)) {
            $args['category__in'] = $category_ids;
        }
    }

    $query = new WP_Query($args);
    $posts = [];

    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            
            // Get post data based on language
            $post_data = fitbody_get_post_multilang_data($post_id, $lang);
            
            // Get featured image
            $featured_image = null;
            if (has_post_thumbnail($post_id)) {
                $image_id = get_post_thumbnail_id($post_id);
                $featured_image = [
                    'id' => $image_id,
                    'source_url' => wp_get_attachment_url($image_id),
                    'alt_text' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                ];
            }

            // Get author data
            $author_id = get_the_author_meta('ID');
            $author_data = [
                'id' => $author_id,
                'name' => get_the_author_meta('display_name'),
                'slug' => get_the_author_meta('user_nicename'),
            ];

            // Get categories and tags
            $categories = get_the_category($post_id);
            $tags = get_the_tags($post_id);

            $formatted_post = [
                'id' => $post_id,
                'title' => ['rendered' => $post_data['title']],
                'content' => ['rendered' => $post_data['content']],
                'excerpt' => ['rendered' => $post_data['excerpt']],
                'date' => get_the_date('c', $post_id),
                'slug' => get_post_field('post_name', $post_id),
                'author' => $author_id,
                'featured_media' => get_post_thumbnail_id($post_id),
                'categories' => array_map(function($cat) { return $cat->term_id; }, $categories ?: []),
                'tags' => array_map(function($tag) { return $tag->term_id; }, $tags ?: []),
                '_embedded' => [
                    'author' => [$author_data],
                    'wp:featuredmedia' => $featured_image ? [$featured_image] : [],
                    'wp:term' => [
                        array_map(function($cat) {
                            return [
                                'id' => $cat->term_id,
                                'name' => $cat->name,
                                'slug' => $cat->slug,
                                'taxonomy' => 'category',
                            ];
                        }, $categories ?: []),
                        array_map(function($tag) {
                            return [
                                'id' => $tag->term_id,
                                'name' => $tag->name,
                                'slug' => $tag->slug,
                                'taxonomy' => 'post_tag',
                            ];
                        }, $tags ?: []),
                    ],
                ],
            ];

            $posts[] = $formatted_post;
        }
        wp_reset_postdata();
    }

    $response = rest_ensure_response($posts);
    $response->header('X-WP-Total', $query->found_posts);
    $response->header('X-WP-TotalPages', $query->max_num_pages);

    return $response;
}

/**
 * Get single blog post by slug with multilingual support
 */
function fitbody_get_blog_post_by_slug_multilang($request) {
    $slug = $request->get_param('slug');
    $lang = $request->get_param('lang') ?: 'mk';

    $post = get_page_by_path($slug, OBJECT, 'post');
    
    if (!$post || $post->post_status !== 'publish') {
        return new WP_Error('post_not_found', 'Post not found', ['status' => 404]);
    }

    $post_id = $post->ID;
    
    // Get post data based on language
    $post_data = fitbody_get_post_multilang_data($post_id, $lang);
    
    // Get featured image
    $featured_image = null;
    if (has_post_thumbnail($post_id)) {
        $image_id = get_post_thumbnail_id($post_id);
        $featured_image = [
            'id' => $image_id,
            'source_url' => wp_get_attachment_url($image_id),
            'alt_text' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
        ];
    }

    // Get author data
    $author_id = $post->post_author;
    $author_data = [
        'id' => $author_id,
        'name' => get_the_author_meta('display_name', $author_id),
        'slug' => get_the_author_meta('user_nicename', $author_id),
    ];

    // Get categories and tags
    $categories = get_the_category($post_id);
    $tags = get_the_tags($post_id);

    $formatted_post = [
        'id' => $post_id,
        'title' => ['rendered' => $post_data['title']],
        'content' => ['rendered' => $post_data['content']],
        'excerpt' => ['rendered' => $post_data['excerpt']],
        'date' => get_the_date('c', $post_id),
        'slug' => $post->post_name,
        'author' => $author_id,
        'featured_media' => get_post_thumbnail_id($post_id),
        'categories' => array_map(function($cat) { return $cat->term_id; }, $categories ?: []),
        'tags' => array_map(function($tag) { return $tag->term_id; }, $tags ?: []),
        '_embedded' => [
            'author' => [$author_data],
            'wp:featuredmedia' => $featured_image ? [$featured_image] : [],
            'wp:term' => [
                array_map(function($cat) {
                    return [
                        'id' => $cat->term_id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'taxonomy' => 'category',
                    ];
                }, $categories ?: []),
                array_map(function($tag) {
                    return [
                        'id' => $tag->term_id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                        'taxonomy' => 'post_tag',
                    ];
                }, $tags ?: []),
            ],
        ],
    ];

    return rest_ensure_response($formatted_post);
}

/**
 * Get blog categories with multilingual support
 */
function fitbody_get_blog_categories_multilang($request) {
    $lang = $request->get_param('lang') ?: 'mk';

    $categories = get_categories([
        'hide_empty' => false,
    ]);

    $formatted_categories = [];
    foreach ($categories as $category) {
        $category_name = fitbody_get_term_multilang_name($category->term_id, 'category', $lang);
        
        $formatted_categories[] = [
            'id' => $category->term_id,
            'name' => $category_name ?: $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'count' => $category->count,
        ];
    }

    return rest_ensure_response($formatted_categories);
}

/**
 * Get post multilingual data
 */
function fitbody_get_post_multilang_data($post_id, $lang = 'mk') {
    if ($lang === 'mk') {
        // Return default WordPress content for Macedonian
        $post = get_post($post_id);
        return [
            'title' => $post->post_title,
            'content' => apply_filters('the_content', $post->post_content),
            'excerpt' => $post->post_excerpt ?: wp_trim_words($post->post_content, 55),
        ];
    }

    // Get translated content from meta fields
    $title_key = '_title_' . $lang;
    $content_key = '_content_' . $lang;
    $excerpt_key = '_excerpt_' . $lang;

    $translated_title = get_post_meta($post_id, $title_key, true);
    $translated_content = get_post_meta($post_id, $content_key, true);
    $translated_excerpt = get_post_meta($post_id, $excerpt_key, true);

    // Fallback to default content if translation doesn't exist
    $post = get_post($post_id);
    
    return [
        'title' => $translated_title ?: $post->post_title,
        'content' => $translated_content ? apply_filters('the_content', $translated_content) : apply_filters('the_content', $post->post_content),
        'excerpt' => $translated_excerpt ?: ($post->post_excerpt ?: wp_trim_words($post->post_content, 55)),
    ];
}

/**
 * Get term multilingual name
 */
function fitbody_get_term_multilang_name($term_id, $taxonomy, $lang = 'mk') {
    if ($lang === 'mk') {
        $term = get_term($term_id, $taxonomy);
        return $term ? $term->name : '';
    }

    $name_key = '_name_' . $lang;
    $translated_name = get_term_meta($term_id, $name_key, true);

    if ($translated_name) {
        return $translated_name;
    }

    // Fallback to default name
    $term = get_term($term_id, $taxonomy);
    return $term ? $term->name : '';
}

/**
 * Add multilingual meta box to post editor
 */
function fitbody_add_multilang_meta_box() {
    add_meta_box(
        'fitbody_multilang_fields',
        '🌍 Multilingual Content',
        'fitbody_render_multilang_meta_box',
        'post',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'fitbody_add_multilang_meta_box');

/**
 * Render multilingual meta box
 */
function fitbody_render_multilang_meta_box($post) {
    // Add nonce for security
    wp_nonce_field('fitbody_save_multilang', 'fitbody_multilang_nonce');
    
    $languages = [
        'en' => ['name' => 'English', 'flag' => '🇺🇸', 'native' => 'English'],
        'es' => ['name' => 'Spanish', 'flag' => '🇪🇸', 'native' => 'Español'],
        'sq' => ['name' => 'Albanian', 'flag' => '🇦🇱', 'native' => 'Shqip']
    ];
    
    // Add CSS for better styling
    echo '<style>
        .fitbody-multilang-container {
            margin: 0 -12px;
        }
        .fitbody-multilang-help {
            background: #e7f3ff;
            border-left: 4px solid #0073aa;
            padding: 12px;
            margin: 0 0 20px 0;
            font-size: 13px;
        }
        .fitbody-multilang-tabs {
            display: flex;
            border-bottom: 1px solid #ccd0d4;
            background: #fafafa;
            margin: 0 0 20px 0;
        }
        .fitbody-multilang-tab {
            padding: 12px 20px;
            cursor: pointer;
            border-right: 1px solid #ccd0d4;
            background: #fafafa;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            font-size: 14px;
        }
        .fitbody-multilang-tab:hover {
            background: #f0f0f0;
        }
        .fitbody-multilang-tab.active {
            background: #fff;
            border-bottom: 3px solid #0073aa;
            font-weight: 600;
        }
        .fitbody-multilang-content {
            display: none;
            padding: 0;
        }
        .fitbody-multilang-content.active {
            display: block;
        }
        .fitbody-multilang-field {
            margin-bottom: 20px;
        }
        .fitbody-multilang-field label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #23282d;
            font-size: 14px;
        }
        .fitbody-multilang-field input[type="text"],
        .fitbody-multilang-field textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: inset 0 1px 2px rgba(0,0,0,.07);
        }
        .fitbody-multilang-field input[type="text"]:focus,
        .fitbody-multilang-field textarea:focus {
            border-color: #0073aa;
            box-shadow: 0 0 0 1px #0073aa;
            outline: none;
        }
        .fitbody-multilang-field textarea {
            resize: vertical;
            min-height: 120px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        }
        .fitbody-multilang-field .description {
            font-style: italic;
            color: #666;
            font-size: 13px;
            margin-top: 5px;
        }
        .fitbody-completion-indicator {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
        }
        .fitbody-completion-complete {
            background: #d4edda;
            color: #155724;
        }
        .fitbody-completion-partial {
            background: #fff3cd;
            color: #856404;
        }
        .fitbody-completion-empty {
            background: #f8d7da;
            color: #721c24;
        }
    </style>';
    
    echo '<div class="fitbody-multilang-container">';
    
    echo '<div class="fitbody-multilang-help">';
    echo '<strong>💡 How it works:</strong> The main content above is for <strong>Macedonian (default language)</strong>. ';
    echo 'Use the tabs below to add translations in English, Spanish, and Albanian. ';
    echo 'Visitors will automatically see content in their selected language.';
    echo '</div>';
    
    // Tabs
    echo '<div class="fitbody-multilang-tabs">';
    $first = true;
    foreach ($languages as $code => $lang) {
        $title_value = get_post_meta($post->ID, '_title_' . $code, true);
        $content_value = get_post_meta($post->ID, '_content_' . $code, true);
        $excerpt_value = get_post_meta($post->ID, '_excerpt_' . $code, true);
        
        $completion = 0;
        if (!empty($title_value)) $completion++;
        if (!empty($content_value)) $completion++;
        if (!empty($excerpt_value)) $completion++;
        
        $completion_class = $completion === 3 ? 'fitbody-completion-complete' : 
                           ($completion > 0 ? 'fitbody-completion-partial' : 'fitbody-completion-empty');
        $completion_text = $completion === 3 ? 'Complete' : 
                          ($completion > 0 ? $completion . '/3' : 'Empty');
        
        echo '<button type="button" class="fitbody-multilang-tab' . ($first ? ' active' : '') . '" data-lang="' . $code . '">';
        echo '<span>' . $lang['flag'] . '</span>';
        echo '<span>' . $lang['native'] . '</span>';
        echo '<span class="fitbody-completion-indicator ' . $completion_class . '">' . $completion_text . '</span>';
        echo '</button>';
        $first = false;
    }
    echo '</div>';
    
    // Content panels
    $first = true;
    foreach ($languages as $code => $lang) {
        $title_key = '_title_' . $code;
        $content_key = '_content_' . $code;
        $excerpt_key = '_excerpt_' . $code;
        
        $title_value = get_post_meta($post->ID, $title_key, true);
        $content_value = get_post_meta($post->ID, $content_key, true);
        $excerpt_value = get_post_meta($post->ID, $excerpt_key, true);
        
        echo '<div class="fitbody-multilang-content' . ($first ? ' active' : '') . '" data-lang="' . $code . '">';
        
        // Title field
        echo '<div class="fitbody-multilang-field">';
        echo '<label for="' . $title_key . '">📝 Title in ' . $lang['native'] . '</label>';
        echo '<input type="text" id="' . $title_key . '" name="' . $title_key . '" value="' . esc_attr($title_value) . '" placeholder="Enter the post title in ' . $lang['native'] . '..." />';
        echo '<p class="description">This will be the main headline for ' . $lang['native'] . ' readers.</p>';
        echo '</div>';
        
        // Excerpt field
        echo '<div class="fitbody-multilang-field">';
        echo '<label for="' . $excerpt_key . '">📄 Excerpt in ' . $lang['native'] . '</label>';
        echo '<textarea id="' . $excerpt_key . '" name="' . $excerpt_key . '" rows="3" placeholder="Brief summary in ' . $lang['native'] . '...">' . esc_textarea($excerpt_value) . '</textarea>';
        echo '<p class="description">A short summary that appears in blog listings and social media previews.</p>';
        echo '</div>';
        
        // Content field
        echo '<div class="fitbody-multilang-field">';
        echo '<label for="' . $content_key . '">📖 Full Content in ' . $lang['native'] . '</label>';
        echo '<textarea id="' . $content_key . '" name="' . $content_key . '" rows="15" placeholder="Write the full blog post content in ' . $lang['native'] . '...">' . esc_textarea($content_value) . '</textarea>';
        echo '<p class="description">The complete blog post content. You can use HTML tags for formatting (bold, italic, links, etc.).</p>';
        echo '</div>';
        
        echo '</div>';
        $first = false;
    }
    
    echo '</div>';
    
    // JavaScript for tab functionality
    echo '<script>
        jQuery(document).ready(function($) {
            $(".fitbody-multilang-tab").on("click", function() {
                var lang = $(this).data("lang");
                
                // Remove active class from all tabs and contents
                $(".fitbody-multilang-tab").removeClass("active");
                $(".fitbody-multilang-content").removeClass("active");
                
                // Add active class to clicked tab and corresponding content
                $(this).addClass("active");
                $(".fitbody-multilang-content[data-lang=\"" + lang + "\"]").addClass("active");
            });
            
            // Update completion indicators when typing
            function updateCompletionIndicator(lang) {
                var title = $("#_title_" + lang).val().trim();
                var content = $("#_content_" + lang).val().trim();
                var excerpt = $("#_excerpt_" + lang).val().trim();
                
                var completion = 0;
                if (title) completion++;
                if (content) completion++;
                if (excerpt) completion++;
                
                var indicator = $(".fitbody-multilang-tab[data-lang=\"" + lang + "\"] .fitbody-completion-indicator");
                
                indicator.removeClass("fitbody-completion-complete fitbody-completion-partial fitbody-completion-empty");
                if (completion === 3) {
                    indicator.addClass("fitbody-completion-complete");
                    indicator.text("Complete");
                } else if (completion > 0) {
                    indicator.addClass("fitbody-completion-partial");
                    indicator.text(completion + "/3");
                } else {
                    indicator.addClass("fitbody-completion-empty");
                    indicator.text("Empty");
                }
            }
            
            // Add event listeners for real-time updates
            ["en", "es", "sq"].forEach(function(lang) {
                ["title", "content", "excerpt"].forEach(function(field) {
                    $("#_" + field + "_" + lang).on("input", function() {
                        updateCompletionIndicator(lang);
                    });
                });
            });
        });
    </script>';
}

/**
 * Save multilingual post fields
 */
function fitbody_save_post_multilang_fields($post_id) {
    // Check if nonce is set
    if (!isset($_POST['fitbody_multilang_nonce'])) {
        return;
    }
    
    // Verify nonce
    if (!wp_verify_nonce($_POST['fitbody_multilang_nonce'], 'fitbody_save_multilang')) {
        return;
    }
    
    // Check if autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    $languages = ['en', 'es', 'sq'];
    
    foreach ($languages as $lang) {
        $title_key = '_title_' . $lang;
        $content_key = '_content_' . $lang;
        $excerpt_key = '_excerpt_' . $lang;
        
        if (isset($_POST[$title_key])) {
            update_post_meta($post_id, $title_key, sanitize_text_field($_POST[$title_key]));
        }
        
        if (isset($_POST[$content_key])) {
            update_post_meta($post_id, $content_key, wp_kses_post($_POST[$content_key]));
        }
        
        if (isset($_POST[$excerpt_key])) {
            update_post_meta($post_id, $excerpt_key, sanitize_textarea_field($_POST[$excerpt_key]));
        }
    }
}
add_action('save_post', 'fitbody_save_post_multilang_fields');

/**
 * Check permissions for blog post creation
 */
function fitbody_check_blog_post_permissions($request) {
    // Check if user is logged in
    if (!is_user_logged_in()) {
        return new WP_Error('rest_forbidden', 'You must be logged in to create posts.', ['status' => 401]);
    }
    
    // Check if user has permission to create posts
    if (!current_user_can('publish_posts') && !current_user_can('edit_posts')) {
        return new WP_Error('rest_forbidden', 'You do not have permission to create posts.', ['status' => 403]);
    }
    
    return true;
}

/**
 * Create multilingual blog post
 */
function fitbody_create_blog_post_multilang($request) {
    $title = $request->get_param('title');
    $content = $request->get_param('content');
    $excerpt = $request->get_param('excerpt');
    $status = $request->get_param('status') ?: 'draft';
    $categories = $request->get_param('categories') ?: [];
    $tags = $request->get_param('tags') ?: [];
    $lang = $request->get_param('lang') ?: 'mk';
    $translation_group = $request->get_param('translation_group');
    
    // Validate required fields
    if (empty($title) || empty($content)) {
        return new WP_Error('missing_fields', 'Title and content are required.', ['status' => 400]);
    }
    
    try {
        if ($lang === 'mk') {
            // Create main post in Macedonian (default language)
            $post_data = [
                'post_title' => sanitize_text_field($title),
                'post_content' => wp_kses_post($content),
                'post_excerpt' => sanitize_textarea_field($excerpt),
                'post_status' => $status,
                'post_type' => 'post',
                'post_author' => get_current_user_id(),
            ];
            
            $post_id = wp_insert_post($post_data);
            
            if (is_wp_error($post_id)) {
                return new WP_Error('post_creation_failed', 'Failed to create post: ' . $post_id->get_error_message(), ['status' => 500]);
            }
            
            // Set categories
            if (!empty($categories)) {
                wp_set_post_categories($post_id, $categories);
            }
            
            // Set tags
            if (!empty($tags)) {
                wp_set_post_tags($post_id, $tags);
            }
            
            // Set translation group
            if ($translation_group) {
                update_post_meta($post_id, '_translation_group', $translation_group);
            }
            
        } else {
            // For non-Macedonian languages, find or create a base post
            $base_post_id = null;
            
            if ($translation_group) {
                // Try to find existing post in this translation group
                $existing_posts = get_posts([
                    'post_type' => 'post',
                    'meta_key' => '_translation_group',
                    'meta_value' => $translation_group,
                    'posts_per_page' => 1,
                    'post_status' => ['publish', 'draft'],
                ]);
                
                if (!empty($existing_posts)) {
                    $base_post_id = $existing_posts[0]->ID;
                }
            }
            
            if (!$base_post_id) {
                // Create a base post in Macedonian first
                $base_post_data = [
                    'post_title' => sanitize_text_field($title . ' (Base)'),
                    'post_content' => wp_kses_post($content),
                    'post_excerpt' => sanitize_textarea_field($excerpt),
                    'post_status' => $status,
                    'post_type' => 'post',
                    'post_author' => get_current_user_id(),
                ];
                
                $base_post_id = wp_insert_post($base_post_data);
                
                if (is_wp_error($base_post_id)) {
                    return new WP_Error('base_post_creation_failed', 'Failed to create base post: ' . $base_post_id->get_error_message(), ['status' => 500]);
                }
                
                // Set categories and tags for base post
                if (!empty($categories)) {
                    wp_set_post_categories($base_post_id, $categories);
                }
                
                if (!empty($tags)) {
                    wp_set_post_tags($base_post_id, $tags);
                }
                
                // Set translation group
                if (!$translation_group) {
                    $translation_group = 'group_' . $base_post_id . '_' . time();
                }
                update_post_meta($base_post_id, '_translation_group', $translation_group);
            }
            
            // Store translation as meta fields
            $title_key = '_title_' . $lang;
            $content_key = '_content_' . $lang;
            $excerpt_key = '_excerpt_' . $lang;
            
            update_post_meta($base_post_id, $title_key, sanitize_text_field($title));
            update_post_meta($base_post_id, $content_key, wp_kses_post($content));
            if ($excerpt) {
                update_post_meta($base_post_id, $excerpt_key, sanitize_textarea_field($excerpt));
            }
            
            $post_id = $base_post_id;
        }
        
        // Get the created/updated post
        $post = get_post($post_id);
        
        if (!$post) {
            return new WP_Error('post_not_found', 'Created post not found.', ['status' => 500]);
        }
        
        // Format response similar to WordPress REST API
        $response_data = [
            'id' => $post->ID,
            'title' => ['rendered' => $post->post_title],
            'content' => ['rendered' => apply_filters('the_content', $post->post_content)],
            'excerpt' => ['rendered' => $post->post_excerpt],
            'status' => $post->post_status,
            'slug' => $post->post_name,
            'date' => get_the_date('c', $post->ID),
            'author' => $post->post_author,
            'categories' => wp_get_post_categories($post->ID, ['fields' => 'ids']),
            'tags' => wp_get_post_tags($post->ID, ['fields' => 'ids']),
            'language' => $lang,
            'translation_group' => get_post_meta($post->ID, '_translation_group', true),
        ];
        
        return rest_ensure_response($response_data);
        
    } catch (Exception $e) {
        return new WP_Error('post_creation_error', 'An error occurred while creating the post: ' . $e->getMessage(), ['status' => 500]);
    }
}

/**
 * Add multilingual fields to category edit form
 */
function fitbody_add_category_multilang_fields($term) {
    $languages = [
        'en' => ['name' => 'English', 'flag' => '🇺🇸', 'native' => 'English'],
        'es' => ['name' => 'Spanish', 'flag' => '🇪🇸', 'native' => 'Español'],
        'sq' => ['name' => 'Albanian', 'flag' => '🇦🇱', 'native' => 'Shqip']
    ];
    
    echo '<tr class="form-field">';
    echo '<th scope="row" colspan="2">';
    echo '<h2 style="margin-top: 20px;">🌍 Category Translations</h2>';
    echo '<p class="description">Add translations for this category name in other languages.</p>';
    echo '</th>';
    echo '</tr>';
    
    foreach ($languages as $code => $lang) {
        $name_key = '_name_' . $code;
        $name_value = get_term_meta($term->term_id, $name_key, true);
        
        echo '<tr class="form-field">';
        echo '<th scope="row">';
        echo '<label for="' . $name_key . '">' . $lang['flag'] . ' ' . $lang['native'] . ' Name</label>';
        echo '</th>';
        echo '<td>';
        echo '<input type="text" id="' . $name_key . '" name="' . $name_key . '" value="' . esc_attr($name_value) . '" class="regular-text" placeholder="Category name in ' . $lang['native'] . '" />';
        echo '<p class="description">The category name that will be displayed to ' . $lang['native'] . ' speakers.</p>';
        echo '</td>';
        echo '</tr>';
    }
}
add_action('category_edit_form_fields', 'fitbody_add_category_multilang_fields');

/**
 * Save category multilingual fields
 */
function fitbody_save_category_multilang_fields($term_id) {
    $languages = ['en', 'es', 'sq'];
    
    foreach ($languages as $lang) {
        $name_key = '_name_' . $lang;
        
        if (isset($_POST[$name_key])) {
            update_term_meta($term_id, $name_key, sanitize_text_field($_POST[$name_key]));
        }
    }
}
add_action('edited_category', 'fitbody_save_category_multilang_fields');
add_action('created_category', 'fitbody_save_category_multilang_fields');


/**
 * Handle contact form submission
 * Sends notification to Telegram and email
 */
function fitbody_handle_contact_form($request) {
    // Get form data
    $name = sanitize_text_field($request->get_param('name'));
    $email = sanitize_email($request->get_param('email'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $subject = sanitize_text_field($request->get_param('subject'));
    $message = sanitize_textarea_field($request->get_param('message'));
    
    // Validate required fields
    if (empty($name) || empty($email) || empty($message)) {
        return new WP_Error('missing_fields', 'Name, email, and message are required', ['status' => 400]);
    }
    
    // Validate email
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Invalid email address', ['status' => 400]);
    }
    
    // Prepare message for Telegram
    $telegram_message = "🔔 *Нова порака од контакт форма*\n\n";
    $telegram_message .= "👤 *Име:* " . $name . "\n";
    $telegram_message .= "📧 *Email:* " . $email . "\n";
    
    if (!empty($phone)) {
        $telegram_message .= "📱 *Телефон:* " . $phone . "\n";
    }
    
    if (!empty($subject)) {
        $telegram_message .= "📋 *Тема:* " . $subject . "\n";
    }
    
    $telegram_message .= "\n💬 *Порака:*\n" . $message;
    
    // Send to Telegram
    $telegram_sent = fitbody_send_telegram_message($telegram_message);
    
    // Send email notification
    $to = get_option('admin_email', 'manevdusko@gmail.com');
    $email_subject = 'Нова порака од контакт форма - ' . ($subject ?: 'Општо прашање');
    $email_message = "Име: {$name}\n";
    $email_message .= "Email: {$email}\n";
    $email_message .= "Телефон: {$phone}\n";
    $email_message .= "Тема: {$subject}\n\n";
    $email_message .= "Порака:\n{$message}\n";
    
    $headers = ['Content-Type: text/plain; charset=UTF-8'];
    $email_sent = wp_mail($to, $email_subject, $email_message, $headers);
    
    // Log submission
    error_log('Contact form submission: ' . $name . ' (' . $email . ')');
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Вашата порака е успешно испратена',
        'telegram_sent' => $telegram_sent,
        'email_sent' => $email_sent,
    ]);
}
