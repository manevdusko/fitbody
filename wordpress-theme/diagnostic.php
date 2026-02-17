<?php
/**
 * Template Name: FitBody Diagnostic Page
 * 
 * This page helps diagnose issues with the FitBody.mk setup
 * Access it at: https://fitbody.mk/wp-admin/admin.php?page=fitbody-diagnostic
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'fitbody_add_diagnostic_page');

function fitbody_add_diagnostic_page() {
    add_menu_page(
        'FitBody Diagnostic',
        'FitBody Diagnostic',
        'manage_options',
        'fitbody-diagnostic',
        'fitbody_render_diagnostic_page',
        'dashicons-admin-tools',
        100
    );
}

function fitbody_render_diagnostic_page() {
    ?>
    <div class="wrap">
        <h1>FitBody.mk Diagnostic Information</h1>
        
        <div class="card">
            <h2>System Information</h2>
            <table class="widefat">
                <tr>
                    <td><strong>Site URL:</strong></td>
                    <td><?php echo esc_html(home_url()); ?></td>
                </tr>
                <tr>
                    <td><strong>WordPress Version:</strong></td>
                    <td><?php echo esc_html(get_bloginfo('version')); ?></td>
                </tr>
                <tr>
                    <td><strong>Active Theme:</strong></td>
                    <td><?php echo esc_html(wp_get_theme()->get('Name')); ?> (<?php echo esc_html(wp_get_theme()->get('Version')); ?>)</td>
                </tr>
                <tr>
                    <td><strong>PHP Version:</strong></td>
                    <td><?php echo esc_html(phpversion()); ?></td>
                </tr>
                <tr>
                    <td><strong>Server Software:</strong></td>
                    <td><?php echo esc_html($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'); ?></td>
                </tr>
            </table>
        </div>

        <div class="card">
            <h2>WordPress Configuration</h2>
            <table class="widefat">
                <tr>
                    <td><strong>Permalink Structure:</strong></td>
                    <td><?php echo esc_html(get_option('permalink_structure') ?: 'Plain (not SEO-friendly)'); ?></td>
                </tr>
                <tr>
                    <td><strong>REST API URL:</strong></td>
                    <td><?php echo esc_html(rest_url()); ?></td>
                </tr>
                <tr>
                    <td><strong>.htaccess Writable:</strong></td>
                    <td><?php echo is_writable(ABSPATH . '.htaccess') ? '✅ Yes' : '❌ No'; ?></td>
                </tr>
                <tr>
                    <td><strong>Rewrite Rules:</strong></td>
                    <td><?php echo get_option('rewrite_rules') ? '✅ Configured' : '❌ Not configured'; ?></td>
                </tr>
            </table>
        </div>

        <div class="card">
            <h2>WooCommerce Status</h2>
            <table class="widefat">
                <tr>
                    <td><strong>WooCommerce Active:</strong></td>
                    <td><?php echo function_exists('WC') ? '✅ Yes' : '❌ No'; ?></td>
                </tr>
                <?php if (function_exists('WC')): ?>
                <tr>
                    <td><strong>WooCommerce Version:</strong></td>
                    <td><?php echo esc_html(WC()->version); ?></td>
                </tr>
                <tr>
                    <td><strong>Product Count:</strong></td>
                    <td><?php echo esc_html(wp_count_posts('product')->publish); ?></td>
                </tr>
                <?php endif; ?>
            </table>
        </div>

        <div class="card">
            <h2>Theme Files Check</h2>
            <table class="widefat">
                <?php
                $theme_dir = get_template_directory();
                $required_files = [
                    'index.html' => 'Next.js Static Export',
                    'index.php' => 'WordPress Template',
                    'functions.php' => 'Theme Functions',
                    '404.php' => '404 Handler',
                    '.htaccess' => 'Apache Config',
                    '_next/static' => 'Next.js Static Assets',
                    'images' => 'Images Directory',
                    'assets' => 'Assets Directory',
                ];
                
                foreach ($required_files as $file => $description) {
                    $path = $theme_dir . '/' . $file;
                    $exists = file_exists($path);
                    echo '<tr>';
                    echo '<td><strong>' . esc_html($description) . ':</strong></td>';
                    echo '<td>' . ($exists ? '✅ Found' : '❌ Missing') . ' (' . esc_html($file) . ')</td>';
                    echo '</tr>';
                }
                ?>
            </table>
        </div>

        <div class="card">
            <h2>API Endpoints Test</h2>
            <table class="widefat">
                <?php
                $endpoints = [
                    '/wp-json/' => 'WordPress REST API Root',
                    '/wp-json/fitbody/v1/health' => 'FitBody Health Check',
                    '/wp-json/fitbody/v1/products/categories' => 'Product Categories',
                    '/wp-json/fitbody/v1/products/featured' => 'Featured Products',
                    '/wp-json/fitbody/v1/home/categories' => 'Home Categories',
                    '/wp-json/fitbody/v1/cart' => 'Cart Endpoint',
                    '/wp-json/fitbody/v1/blog/posts' => 'Blog Posts',
                ];
                
                foreach ($endpoints as $endpoint => $description) {
                    $url = home_url($endpoint);
                    $response = wp_remote_get($url, ['timeout' => 5]);
                    $status_code = wp_remote_retrieve_response_code($response);
                    
                    echo '<tr>';
                    echo '<td><strong>' . esc_html($description) . ':</strong></td>';
                    echo '<td>';
                    
                    if (is_wp_error($response)) {
                        echo '❌ Error: ' . esc_html($response->get_error_message());
                    } else {
                        if ($status_code === 200) {
                            echo '✅ Working (200)';
                        } elseif ($status_code === 404) {
                            echo '❌ Not Found (404)';
                        } elseif ($status_code === 503) {
                            echo '❌ Service Unavailable (503)';
                        } else {
                            echo '⚠️ Status: ' . esc_html($status_code);
                        }
                    }
                    
                    echo ' <a href="' . esc_url($url) . '" target="_blank">Test</a>';
                    echo '</td>';
                    echo '</tr>';
                }
                ?>
            </table>
        </div>

        <div class="card">
            <h2>Static Files Test</h2>
            <table class="widefat">
                <?php
                $theme_url = get_template_directory_uri();
                $static_files = [
                    '/images/hero.mp4' => 'Hero Video',
                    '/assets/logo.png' => 'Logo',
                    '/favicon.ico' => 'Favicon',
                    '/_next/static/css' => 'Next.js CSS Directory',
                    '/_next/static/chunks' => 'Next.js JS Chunks',
                ];
                
                foreach ($static_files as $file => $description) {
                    $url = $theme_url . $file;
                    $response = wp_remote_head($url, ['timeout' => 5]);
                    $status_code = wp_remote_retrieve_response_code($response);
                    
                    echo '<tr>';
                    echo '<td><strong>' . esc_html($description) . ':</strong></td>';
                    echo '<td>';
                    
                    if (is_wp_error($response)) {
                        echo '❌ Error: ' . esc_html($response->get_error_message());
                    } else {
                        if ($status_code === 200) {
                            echo '✅ Accessible (200)';
                        } elseif ($status_code === 404) {
                            echo '❌ Not Found (404)';
                        } elseif ($status_code === 503) {
                            echo '❌ Service Unavailable (503) - Server trying to execute as PHP';
                        } else {
                            echo '⚠️ Status: ' . esc_html($status_code);
                        }
                    }
                    
                    echo ' <a href="' . esc_url($url) . '" target="_blank">Test</a>';
                    echo '</td>';
                    echo '</tr>';
                }
                ?>
            </table>
        </div>

        <div class="card">
            <h2>Quick Actions</h2>
            <p>
                <a href="<?php echo admin_url('options-permalink.php'); ?>" class="button button-primary">
                    Flush Permalinks
                </a>
                <a href="<?php echo admin_url('plugins.php'); ?>" class="button">
                    Check Plugins
                </a>
                <a href="<?php echo admin_url('themes.php'); ?>" class="button">
                    Check Themes
                </a>
            </p>
        </div>

        <div class="card">
            <h2>Recommendations</h2>
            <ul>
                <li><strong>If API endpoints return 404:</strong> Go to Settings → Permalinks and click "Save Changes" to flush rewrite rules.</li>
                <li><strong>If static files return 503:</strong> Contact your hosting provider - the server is trying to execute .js files as PHP instead of serving them as static files.</li>
                <li><strong>If .htaccess is not writable:</strong> Set file permissions to 644 or contact your hosting provider.</li>
                <li><strong>If rewrite rules are not configured:</strong> Flush permalinks or check if mod_rewrite is enabled on your server.</li>
            </ul>
        </div>
    </div>

    <style>
        .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .card h2 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .widefat td {
            padding: 10px;
        }
        .widefat tr:nth-child(even) {
            background: #f9f9f9;
        }
    </style>
    <?php
}
