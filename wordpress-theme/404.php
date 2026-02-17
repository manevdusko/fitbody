<?php
/**
 * 404 template for FitBody.mk theme
 * Redirects to Next.js app for better handling
 */

// Check if this might be a Next.js route
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = rtrim($path, '/');

$nextjs_routes = ['/products', '/dealer', '/cart', '/checkout', '/about', '/contact'];

foreach ($nextjs_routes as $route) {
    if ($path === $route || strpos($path, $route . '/') === 0) {
        // This looks like a Next.js route, serve the app
        $index_file = get_template_directory() . '/index.html';
        if (file_exists($index_file)) {
            header('Content-Type: text/html; charset=UTF-8');
            $content = file_get_contents($index_file);
            
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
            
            $content = str_replace('</head>', $wordpress_vars . '</head>', $content);
            
            // Fix asset paths to point to theme directory
            $theme_url = get_template_directory_uri();
            $content = str_replace('/_next/', $theme_url . '/_next/', $content);
            $content = str_replace('"/images/', '"' . $theme_url . '/images/', $content);
            $content = str_replace('"/assets/', '"' . $theme_url . '/assets/', $content);
            
            echo $content;
            exit;
        }
    }
}

// Otherwise show regular 404
get_header();
?>

<div class="error-404">
    <h1>Page Not Found</h1>
    <p>The page you are looking for could not be found.</p>
    <p><a href="<?php echo home_url(); ?>">Return to Home</a></p>
</div>

<?php get_footer(); ?>