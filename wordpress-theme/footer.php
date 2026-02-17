<?php
/**
 * Footer template for FitBody.mk theme
 */

// Only show WordPress footer if we're in WordPress admin or on WordPress pages
if (is_admin() || is_home() || is_front_page()) {
    wp_footer();
}
?>
</body>
</html>