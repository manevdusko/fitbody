<?php
/**
 * Header template for FitBody.mk theme
 * This file is required by WordPress
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if we're trying to access a Next.js route
$request_uri = $_SERVER['REQUEST_URI'] ?? '';

// List of Next.js routes that should be handled by the static app
$nextjs_routes = [
    '/products/',
    '/dealer/',
    '/cart',
    '/checkout',
    '/about',
    '/contact'
];

// Check if this is a Next.js route
$is_nextjs_route = false;
foreach ($nextjs_routes as $route) {
    if (strpos($request_uri, $route) === 0) {
        $is_nextjs_route = true;
        break;
    }
}

// If it's a Next.js route, serve the static index.html
if ($is_nextjs_route) {
    $index_file = get_template_directory() . '/index.html';
    if (file_exists($index_file)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($index_file);
        exit;
    }
}

// For WordPress pages, output proper HTML header
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php 
if (function_exists('wp_body_open')) {
    wp_body_open();
}
?>