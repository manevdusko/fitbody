// =============================================================================
// CORE TYPES
// =============================================================================

/** Base entity with common properties */
export interface BaseEntity {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
}

/** Stock status enumeration */
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

/** Product type enumeration */
export type ProductType = 'simple' | 'variable' | 'grouped' | 'external';

/** Dealer status enumeration */
export type DealerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// =============================================================================
// PRODUCT TYPES
// =============================================================================

/** Product image with required alt text for accessibility */
export interface ProductImage {
  readonly id: number;
  readonly src: string;
  readonly alt: string;
}

/** Product category information */
export interface ProductCategory extends BaseEntity {
  readonly description?: string;
  readonly count?: number;
  readonly translations?: {
    readonly en: string;
    readonly es: string;
    readonly mk: string;
    readonly sq: string;
  };
}

/** Home page category with display properties */
export interface HomeCategory extends ProductCategory {
  readonly description: string;
  readonly count: number;
  readonly icon: string;
  readonly order: number;
  readonly href: string;
  readonly translations: {
    readonly en: string;
    readonly es: string;
    readonly mk: string;
    readonly sq: string;
  };
}

/** Product attribute definition */
export interface ProductAttribute extends BaseEntity {
  readonly options: readonly string[];
  readonly variation: boolean;
  readonly visible: boolean;
}

/** Product variation with pricing and stock info */
export interface ProductVariation {
  readonly id: number;
  readonly price: string;
  readonly regular_price: string;
  readonly sale_price: string;
  readonly stock_status: StockStatus;
  readonly stock_quantity: number;
  readonly attributes: Readonly<Record<string, string>>;
  readonly image?: ProductImage;
  readonly dealer_price?: string;
}

/** Promotion information */
export interface ProductPromotion {
  readonly price: string;
  readonly label: string;
  readonly start_date: string;
  readonly end_date: string;
}

/** Generic metadata key-value pair */
export interface MetaData {
  readonly key: string;
  readonly value: string;
}

/** Main product interface */
export interface Product extends BaseEntity {
  readonly description: string;
  readonly short_description: string;
  readonly price: string;
  readonly regular_price: string;
  readonly sale_price: string;
  readonly images: readonly ProductImage[];
  readonly categories: readonly ProductCategory[];
  readonly stock_status: StockStatus;
  readonly stock_quantity: number;
  readonly type: ProductType;
  readonly meta_data: readonly MetaData[];
  
  // Multi-language support
  readonly language?: string;
  readonly available_languages?: readonly string[];
  readonly translations?: {
    readonly title?: {
      readonly en?: string;
      readonly es?: string;
      readonly mk?: string;
      readonly sq?: string;
    };
    readonly description?: {
      readonly en?: string;
      readonly es?: string;
      readonly mk?: string;
      readonly sq?: string;
    };
    readonly short_description?: {
      readonly en?: string;
      readonly es?: string;
      readonly mk?: string;
      readonly sq?: string;
    };
  };
  
  // Optional dealer properties
  readonly dealer_price?: string;
  readonly is_dealer_only?: boolean;
  
  // Optional promotion properties
  readonly is_promotion?: boolean;
  readonly promotion?: ProductPromotion;
  
  // Backward compatibility - deprecated fields
  /** @deprecated Use promotion.price instead */
  readonly promotion_price?: string;
  /** @deprecated Use promotion.label instead */
  readonly promotion_label?: string;
  /** @deprecated Use promotion.start_date instead */
  readonly promotion_start_date?: string;
  /** @deprecated Use promotion.end_date instead */
  readonly promotion_end_date?: string;
  
  // Optional variation properties
  readonly variations?: readonly ProductVariation[];
  readonly attributes?: readonly ProductAttribute[];
}

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

/** User role enumeration */
export type UserRole = 'customer' | 'dealer' | 'administrator' | 'shop_manager';

/** Dealer-specific information */
export interface DealerInfo {
  readonly status: DealerStatus;
  readonly company: string;
  readonly business_type: string;
  readonly phone: string;
  readonly address: string;
  readonly city: string;
  readonly postal_code: string;
  readonly tax_number: string;
}

/** User account information */
export interface User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly roles: readonly UserRole[];
  readonly is_dealer: boolean;
  readonly dealer_info?: DealerInfo;
  
  // Backward compatibility - deprecated fields
  /** @deprecated Use dealer_info.status instead */
  readonly dealer_status?: DealerStatus;
  /** @deprecated Use dealer_info.company instead */
  readonly dealer_company?: string;
  /** @deprecated Use dealer_info.business_type instead */
  readonly dealer_business_type?: string;
  /** @deprecated Use dealer_info.phone instead */
  readonly dealer_phone?: string;
  /** @deprecated Use dealer_info.address instead */
  readonly dealer_address?: string;
  /** @deprecated Use dealer_info.city instead */
  readonly dealer_city?: string;
  /** @deprecated Use dealer_info.postal_code instead */
  readonly dealer_postal_code?: string;
  /** @deprecated Use dealer_info.tax_number instead */
  readonly dealer_tax_number?: string;
}

// =============================================================================
// CART & COMMERCE TYPES
// =============================================================================

/** Cart item variation attributes */
export type CartItemVariation = Readonly<Record<string, string>>;

/** Cart item with all necessary information */
export interface CartItem {
  readonly key: string;
  readonly id: number;
  readonly product_id: number;
  readonly quantity: number;
  readonly name: string;
  readonly price: string;
  readonly total: string;
  readonly image: ProductImage;
  readonly variation_id?: number;
  readonly variation?: CartItemVariation;
}

/** Shipping information */
export interface ShippingInfo {
  readonly cost: number;
  readonly label: string;
  readonly description: string;
}

/** Cart totals with currency */
export interface CartTotals {
  readonly subtotal: string;
  readonly total: string;
  readonly currency: string;
}

/** Complete cart state */
export interface Cart {
  readonly items: readonly CartItem[];
  readonly totals: CartTotals;
  readonly shipping?: ShippingInfo;
}

// =============================================================================
// FILTER & SEARCH TYPES
// =============================================================================

/** Price range tuple */
export type PriceRange = readonly [number, number];

/** Product filter state */
export interface FilterState {
  readonly categories: readonly number[];
  readonly priceRange: PriceRange;
  readonly goals: readonly string[];
  readonly search: string;
}

// =============================================================================
// API & RESPONSE TYPES
// =============================================================================

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
  readonly success: boolean;
}

/** API error response */
export interface ApiError {
  readonly status: number;
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
}

/** Pagination metadata */
export interface PaginationMeta {
  readonly total: number;
  readonly total_pages: number;
  readonly current_page: number;
  readonly per_page: number;
  readonly has_next: boolean;
  readonly has_previous: boolean;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<readonly T[]> {
  readonly pagination: PaginationMeta;
}

// =============================================================================
// FORM & INPUT TYPES
// =============================================================================

/** Form validation error */
export interface FormError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

/** Form state for complex forms */
export interface FormState<T = Record<string, unknown>> {
  readonly data: T;
  readonly errors: readonly FormError[];
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
  readonly isDirty: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Make all properties optional recursively */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract keys of type T that have values of type U */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/** Make specific properties required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific properties optional */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/** Common props for components that can be disabled */
export interface DisableableProps {
  readonly disabled?: boolean;
}

/** Common props for components with loading states */
export interface LoadingProps {
  readonly loading?: boolean;
}

/** Common props for components with error states */
export interface ErrorProps {
  readonly error?: string | null;
}

/** Base component props combining common patterns */
export interface BaseComponentProps extends DisableableProps, LoadingProps, ErrorProps {
  readonly className?: string;
  readonly testId?: string;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/** Custom event handler types */
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

/** Product-related event types */
export type ProductEventHandler = EventHandler<Product>;
export type CartEventHandler = EventHandler<CartItem>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/** Type guard to check if a product has variations */
export const isVariableProduct = (product: Product): product is Product & { variations: readonly ProductVariation[] } => {
  return product.type === 'variable' && Array.isArray(product.variations) && product.variations.length > 0;
};

/** Type guard to check if a user is a dealer */
export const isDealer = (user: User): user is User & { dealer_info: DealerInfo } => {
  return user.is_dealer && user.dealer_info !== undefined;
};

/** Type guard to check if response is an error */
export const isApiError = (response: unknown): response is ApiError => {
  return typeof response === 'object' && response !== null && 'status' in response && 'message' in response;
};