<?php
/**
 * Main template file for FitBody.mk theme
 * Serves Next.js static export with WordPress integration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get the current request URI
$request_uri = $_SERVER['REQUEST_URI'];
$parsed_url = parse_url($request_uri);
$path = $parsed_url['path'];

// Remove trailing slash for consistency
$path = rtrim($path, '/');

// Define Next.js routes that should serve the static app
$nextjs_routes = [
    '/products',
    '/dealer',
    '/cart',
    '/checkout',
    '/about',
    '/contact',
    '/blog'
];

// Check if this is a Next.js route or a product page
$is_nextjs_route = false;
if (empty($path) || $path === '/') {
    // Home page - serve Next.js
    $is_nextjs_route = true;
} else {
    // Check against defined routes
    foreach ($nextjs_routes as $route) {
        if ($path === $route || strpos($path, $route . '/') === 0) {
            $is_nextjs_route = true;
            break;
        }
    }
}

// Serve Next.js static export for app routes
if ($is_nextjs_route) {
    $index_file = get_template_directory() . '/index.html';
    
    if (file_exists($index_file)) {
        // Set proper headers
        header('Content-Type: text/html; charset=UTF-8');
        
        // Read and output the Next.js index.html
        $content = file_get_contents($index_file);
        
        // Inject WordPress variables for API URLs and current path
        $current_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $wordpress_vars = sprintf(
            '<script>
                window.WORDPRESS_API_URL = "%s";
                window.WOOCOMMERCE_API_URL = "%s";
                window.THEME_URL = "%s";
                window.INITIAL_PATH = "%s";
            </script>',
            esc_js(home_url('/wp-json/wp/v2')),
            esc_js(home_url('/wp-json/fitbody/v1')),
            esc_js(get_template_directory_uri()),
            esc_js($current_path)
        );
        
        // Insert the variables before the closing head tag
        $content = str_replace('</head>', $wordpress_vars . '</head>', $content);
        
        // Fix asset paths to point to theme directory
        $theme_url = get_template_directory_uri();
        $content = str_replace('/_next/', $theme_url . '/_next/', $content);
        $content = str_replace('"/images/', '"' . $theme_url . '/images/', $content);
        $content = str_replace('"/assets/', '"' . $theme_url . '/assets/', $content);
        
        echo $content;
        exit;
    } else {
        // Fallback if index.html doesn't exist
        echo '<h1>FitBody.mk</h1><p>Next.js app not found. Please deploy the static export.</p>';
        exit;
    }
}

// For WordPress admin, API endpoints, and other WordPress functionality
get_header();
?>

<div class="wordpress-content">
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article>
                <h1><?php the_title(); ?></h1>
                <div><?php the_content(); ?></div>
            </article>
        <?php endwhile; ?>
    <?php else : ?>
        <h1>Page Not Found</h1>
        <p>The requested page could not be found.</p>
        <p><a href="<?php echo home_url(); ?>">Return to Home</a></p>
    <?php endif; ?>
</div>

<?php get_footer(); ?>