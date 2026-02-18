<?php
/**
 * Custom Cart System for Headless WordPress
 * 
 * This implements a database-based cart that works across domains
 * without relying on WooCommerce sessions or cookies.
 */

// Create custom cart table on activation
function fitbody_create_cart_table() {
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
        PRIMARY KEY  (id),
        KEY session_token (session_token),
        KEY user_id (user_id),
        KEY product_id (product_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// Run on theme activation
add_action('after_switch_theme', 'fitbody_create_cart_table');

/**
 * Get or create session token
 */
function fitbody_get_session_token() {
    $headers = getallheaders();
    
    if (isset($headers['X-Cart-Session'])) {
        return sanitize_text_field($headers['X-Cart-Session']);
    } elseif (isset($_SERVER['HTTP_X_CART_SESSION'])) {
        return sanitize_text_field($_SERVER['HTTP_X_CART_SESSION']);
    }
    
    // Generate new token
    return wp_generate_uuid4();
}

/**
 * Get cart items from database
 */
function fitbody_get_cart_items($session_token, $user_id = null) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    if ($user_id) {
        $items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at ASC",
            $user_id
        ));
    } else {
        $items = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table_name WHERE session_token = %s ORDER BY created_at ASC",
            $session_token
        ));
    }
    
    return $items ?: [];
}

/**
 * Add item to cart
 */
function fitbody_add_cart_item($session_token, $product_id, $quantity, $variation_id = null, $variation_data = null, $user_id = null) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    // Check if item already exists
    $where = ['session_token' => $session_token, 'product_id' => $product_id];
    if ($variation_id) {
        $where['variation_id'] = $variation_id;
    }
    
    $existing = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE session_token = %s AND product_id = %d AND variation_id = %d",
        $session_token,
        $product_id,
        $variation_id ?: 0
    ));
    
    if ($existing) {
        // Update quantity
        $new_quantity = $existing->quantity + $quantity;
        $wpdb->update(
            $table_name,
            ['quantity' => $new_quantity],
            ['id' => $existing->id]
        );
        return $existing->id;
    } else {
        // Insert new item
        $wpdb->insert(
            $table_name,
            [
                'session_token' => $session_token,
                'user_id' => $user_id,
                'product_id' => $product_id,
                'variation_id' => $variation_id,
                'quantity' => $quantity,
                'variation_data' => $variation_data ? json_encode($variation_data) : null,
            ]
        );
        return $wpdb->insert_id;
    }
}

/**
 * Update cart item quantity
 */
function fitbody_update_cart_item($cart_item_id, $quantity) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    if ($quantity <= 0) {
        return fitbody_remove_cart_item($cart_item_id);
    }
    
    return $wpdb->update(
        $table_name,
        ['quantity' => $quantity],
        ['id' => $cart_item_id]
    );
}

/**
 * Remove cart item
 */
function fitbody_remove_cart_item($cart_item_id) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    return $wpdb->delete($table_name, ['id' => $cart_item_id]);
}

/**
 * Clear entire cart
 */
function fitbody_clear_cart($session_token, $user_id = null) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    if ($user_id) {
        return $wpdb->delete($table_name, ['user_id' => $user_id]);
    } else {
        return $wpdb->delete($table_name, ['session_token' => $session_token]);
    }
}

/**
 * Format cart items for API response
 */
function fitbody_format_cart_response($session_token, $user_id = null) {
    $cart_items = fitbody_get_cart_items($session_token, $user_id);
    $formatted_items = [];
    $subtotal = 0;
    
    // Check if user is dealer
    $is_dealer = false;
    if ($user_id) {
        $is_dealer_meta = get_user_meta($user_id, 'is_dealer', true);
        $dealer_status = get_user_meta($user_id, 'dealer_status', true);
        $is_dealer = $is_dealer_meta === '1' && $dealer_status === 'approved';
    }
    
    foreach ($cart_items as $item) {
        $product_id = $item->variation_id ?: $item->product_id;
        $product = wc_get_product($product_id);
        
        if (!$product || !$product->exists()) {
            // Remove invalid items
            fitbody_remove_cart_item($item->id);
            continue;
        }
        
        // Get image
        $image_id = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_url($image_id) : '';
        
        // Get price (dealer or regular)
        $price = $product->get_price();
        if ($is_dealer) {
            $dealer_price = get_post_meta($item->product_id, '_dealer_price', true);
            if ($dealer_price) {
                $price = $dealer_price;
            }
        }
        
        $line_total = floatval($price) * intval($item->quantity);
        $subtotal += $line_total;
        
        $formatted_items[] = [
            'key' => (string)$item->id,
            'id' => $item->product_id,
            'variation_id' => $item->variation_id,
            'quantity' => intval($item->quantity),
            'name' => $product->get_name(),
            'price' => $price,
            'total' => $line_total,
            'image' => [
                'id' => $image_id,
                'src' => $image_url,
                'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true) ?: $product->get_name(),
            ],
            'variation_data' => $item->variation_data ? json_decode($item->variation_data, true) : null,
        ];
    }
    
    return [
        'items' => $formatted_items,
        'totals' => [
            'subtotal' => (string)$subtotal,
            'total' => (string)$subtotal,
            'currency' => get_woocommerce_currency(),
        ],
    ];
}

/**
 * Clean up old cart items (run daily)
 */
function fitbody_cleanup_old_carts() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'fitbody_cart';
    
    // Delete carts older than 7 days
    $wpdb->query("DELETE FROM $table_name WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
}

// Schedule cleanup
if (!wp_next_scheduled('fitbody_cleanup_carts')) {
    wp_schedule_event(time(), 'daily', 'fitbody_cleanup_carts');
}
add_action('fitbody_cleanup_carts', 'fitbody_cleanup_old_carts');
