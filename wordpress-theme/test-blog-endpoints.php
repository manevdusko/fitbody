<?php
/**
 * Blog Endpoints Test Script
 * 
 * Access this file directly to test if blog endpoints are working
 * URL: https://api.fitbody.mk/wp-content/themes/fitbody-ecommerce/test-blog-endpoints.php
 */

// Load WordPress
require_once('../../../wp-load.php');

header('Content-Type: application/json');

$results = [];

// Test 1: Check if REST API is available
$results['rest_api_available'] = function_exists('rest_url');
$results['rest_url'] = rest_url();

// Test 2: Check if blog endpoints are registered
$rest_server = rest_get_server();
$routes = $rest_server->get_routes();

$results['blog_posts_endpoint_registered'] = isset($routes['/fitbody/v1/blog/posts']);
$results['blog_single_endpoint_registered'] = isset($routes['/fitbody/v1/blog/posts/(?P<slug>[^/]+)']);
$results['blog_categories_endpoint_registered'] = isset($routes['/fitbody/v1/blog/categories']);

// Test 3: Try to fetch blog posts directly
if (function_exists('fitbody_get_blog_posts_multilang')) {
    $request = new WP_REST_Request('GET', '/fitbody/v1/blog/posts');
    $request->set_param('per_page', 5);
    $request->set_param('lang', 'mk');
    
    try {
        $response = fitbody_get_blog_posts_multilang($request);
        $results['direct_call_success'] = true;
        $results['direct_call_data'] = $response->get_data();
        $results['post_count'] = count($response->get_data());
    } catch (Exception $e) {
        $results['direct_call_success'] = false;
        $results['direct_call_error'] = $e->getMessage();
    }
} else {
    $results['function_exists'] = false;
}

// Test 4: Check if there are any published posts
$posts_query = new WP_Query([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => 1,
]);

$results['published_posts_count'] = $posts_query->found_posts;
$results['has_posts'] = $posts_query->have_posts();

// Test 5: Check permalink structure
$results['permalink_structure'] = get_option('permalink_structure');
$results['rewrite_rules_exist'] = !empty(get_option('rewrite_rules'));

// Test 6: Test actual HTTP request to endpoint
$test_url = home_url('/wp-json/fitbody/v1/blog/posts?per_page=5');
$http_response = wp_remote_get($test_url, ['timeout' => 10]);

if (is_wp_error($http_response)) {
    $results['http_test_success'] = false;
    $results['http_test_error'] = $http_response->get_error_message();
} else {
    $results['http_test_success'] = true;
    $results['http_test_status'] = wp_remote_retrieve_response_code($http_response);
    $results['http_test_body_length'] = strlen(wp_remote_retrieve_body($http_response));
}

// Output results
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
