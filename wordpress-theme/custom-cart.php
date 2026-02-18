<?php
/**
 * Custom Cart System - Simplified & Clean
 * Database-based cart for headless WordPress
 */

// ============================================================================
// DATABASE TABLE SETUP
// ============================================================================

add_action('after_switch_theme', function() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        session_token varchar(255) NOT NULL,
        user_id bigint(20) DEFAULT NULL,
        product_id bigint(20) NOT NULL,
        variation_id bigint(20) DEFAULT NULL,
        quantity int(11) NOT NULL DEFAULT 1,
        variation_data text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY session_token (session_token),
        KEY user_id (user_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});

// ============================================================================
// SESSION TOKEN MANAGEMENT
// ============================================================================

function fitbody_get_session_token() {
    $headers = getallheaders();
    
    if (isset($headers['X-Cart-Session'])) {
        return sanitize_text_field($headers['X-Cart-Session']);
    }
    
    if (isset($_SERVER['HTTP_X_CART_SESSION'])) {
        return sanitize_text_field($_SERVER['HTTP_X_CART_SESSION']);
    }
    
    return wp_generate_uuid4();
}

// ============================================================================
// CART OPERATIONS
// ============================================================================

function fitbody_get_cart_items($session_token, $user_id = null) {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    
    if ($user_id) {
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE user_id = %d ORDER BY created_at ASC",
            $user_id
        )) ?: [];
    }
    
    return $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM $table WHERE session_token = %s ORDER BY created_at ASC",
        $session_token
    )) ?: [];
}

function fitbody_add_cart_item($session_token, $product_id, $quantity, $variation_id = null, $variation_data = null, $user_id = null) {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    
    // Check if item exists
    $existing = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table WHERE session_token = %s AND product_id = %d AND variation_id = %d",
        $session_token,
        $product_id,
        $variation_id ?: 0
    ));
    
    if ($existing) {
        // Update quantity
        $wpdb->update(
            $table,
            ['quantity' => $existing->quantity + $quantity],
            ['id' => $existing->id]
        );
        return $existing->id;
    }
    
    // Insert new item
    $wpdb->insert($table, [
        'session_token' => $session_token,
        'user_id' => $user_id,
        'product_id' => $product_id,
        'variation_id' => $variation_id,
        'quantity' => $quantity,
        'variation_data' => $variation_data ? json_encode($variation_data) : null
    ]);
    
    return $wpdb->insert_id;
}

function fitbody_update_cart_item($cart_item_id, $quantity) {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    
    if ($quantity <= 0) {
        return fitbody_remove_cart_item($cart_item_id);
    }
    
    return $wpdb->update($table, ['quantity' => $quantity], ['id' => $cart_item_id]);
}

function fitbody_remove_cart_item($cart_item_id) {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    
    return $wpdb->delete($table, ['id' => $cart_item_id]);
}

function fitbody_clear_cart($session_token, $user_id = null) {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    
    if ($user_id) {
        return $wpdb->delete($table, ['user_id' => $user_id]);
    }
    
    return $wpdb->delete($table, ['session_token' => $session_token]);
}

// ============================================================================
// FORMAT CART FOR API RESPONSE
// ============================================================================

function fitbody_format_cart_response($session_token, $user_id = null) {
    $items = fitbody_get_cart_items($session_token, $user_id);
    $formatted = [];
    $subtotal = 0;
    
    // Check if user is dealer
    $is_dealer = false;
    if ($user_id) {
        $is_dealer = get_user_meta($user_id, 'is_dealer', true) === '1' 
                  && get_user_meta($user_id, 'dealer_status', true) === 'approved';
    }
    
    foreach ($items as $item) {
        $product_id = $item->variation_id ?: $item->product_id;
        $product = wc_get_product($product_id);
        
        if (!$product || !$product->exists()) {
            fitbody_remove_cart_item($item->id);
            continue;
        }
        
        // Get price
        $price = $product->get_price();
        if ($is_dealer) {
            $dealer_price = get_post_meta($item->product_id, '_dealer_price', true);
            if ($dealer_price) $price = $dealer_price;
        }
        
        $line_total = floatval($price) * intval($item->quantity);
        $subtotal += $line_total;
        
        $image_id = $product->get_image_id();
        
        $formatted[] = [
            'key' => (string)$item->id,
            'id' => $item->product_id,
            'variation_id' => $item->variation_id,
            'quantity' => intval($item->quantity),
            'name' => $product->get_name(),
            'price' => $price,
            'total' => $line_total,
            'image' => [
                'id' => $image_id,
                'src' => $image_id ? wp_get_attachment_url($image_id) : '',
                'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true) ?: $product->get_name()
            ],
            'variation_data' => $item->variation_data ? json_decode($item->variation_data, true) : null
        ];
    }
    
    return [
        'items' => $formatted,
        'totals' => [
            'subtotal' => (string)$subtotal,
            'total' => (string)$subtotal,
            'currency' => get_woocommerce_currency()
        ]
    ];
}

// ============================================================================
// CLEANUP OLD CARTS (DAILY)
// ============================================================================

if (!wp_next_scheduled('fitbody_cleanup_carts')) {
    wp_schedule_event(time(), 'daily', 'fitbody_cleanup_carts');
}

add_action('fitbody_cleanup_carts', function() {
    global $wpdb;
    $table = $wpdb->prefix . 'fitbody_cart';
    $wpdb->query("DELETE FROM $table WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
});
