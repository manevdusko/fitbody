/**
 * API Client for FitBody E-commerce Platform
 * 
 * This module provides a centralized API client for communicating with the
 * WordPress/WooCommerce backend at api.fitbody.mk
 * 
 * @module utils/api
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { Product, PaginationMeta, User, Cart } from '@/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/** WordPress REST API base URL */
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://api.fitbody.mk/wp-json/wp/v2';

/** Custom FitBody API endpoints (proxy for WooCommerce) */
const WOOCOMMERCE_PROXY_URL = `${WORDPRESS_API_URL.replace('/wp/v2', '')}/fitbody/v1`;

/** Authentication token cookie name */
const AUTH_TOKEN_COOKIE = 'auth_token';

/** Token expiration in days */
const TOKEN_EXPIRY_DAYS = 7;

// =============================================================================
// AXIOS INSTANCES
// =============================================================================

/**
 * Create axios instance with default configuration
 */
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token and cart session
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get(AUTH_TOKEN_COOKIE);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add cart session token for cart-related requests
      let cartSession = Cookies.get('cart_session');
      
      // Generate session token if none exists (first time user)
      if (!cartSession && typeof window !== 'undefined') {
        cartSession = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        Cookies.set('cart_session', cartSession, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
      
      if (cartSession) {
        config.headers['X-Cart-Session'] = cartSession;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors and cart session
  instance.interceptors.response.use(
    (response) => {
      // Store cart session token from response header
      const cartSession = response.headers['x-cart-session'];
      if (cartSession) {
        console.log('[Cart Session] Received from server:', cartSession);
        Cookies.set('cart_session', cartSession, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
      return response;
    },
    (error: AxiosError) => {
      // Handle authentication errors
      if (error.response?.status === 401) {
        Cookies.remove(AUTH_TOKEN_COOKIE);
        if (typeof window !== 'undefined') {
          console.warn('Authentication expired. Please log in again.');
        }
      }
      
      // Log error details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

/** WordPress API client */
const wpApi = createApiInstance(WORDPRESS_API_URL);

/** WooCommerce API client (via proxy) */
const wcApi = createApiInstance(WOOCOMMERCE_PROXY_URL);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extract pagination metadata from response headers
 */
const extractPaginationMeta = (
  headers: Record<string, string>,
  currentPage: number = 1,
  perPage: number = 12
): PaginationMeta => {
  const total = parseInt(headers['x-wp-total'] || headers['X-WP-Total'] || '0', 10);
  const totalPages = parseInt(headers['x-wp-totalpages'] || headers['X-WP-TotalPages'] || '0', 10);

  return {
    total,
    total_pages: totalPages,
    current_page: currentPage,
    per_page: perPage,
    has_next: currentPage < totalPages,
    has_previous: currentPage > 1,
  };
};

/**
 * Handle API errors with user-friendly messages
 */
const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(`${context}: ${message}`);
  }
  throw error;
};

// =============================================================================
// PRODUCTS API
// =============================================================================

export interface ProductsQueryParams {
  page?: number;
  per_page?: number;
  category?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  lang?: string;
}

export const productsApi = {
  /**
   * Get all products with optional filtering and pagination
   */
  getAll: async (params?: ProductsQueryParams): Promise<{ products: Product[]; meta: PaginationMeta }> => {
    try {
      const response = await wcApi.get<Product[]>('/products', { params });
      const meta = extractPaginationMeta(response.headers, params?.page, params?.per_page);

      return {
        products: response.data,
        meta,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch products');
    }
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: number, lang?: string): Promise<Product> => {
    try {
      const params = lang ? { lang } : {};
      const response = await wcApi.get<Product>(`/products/${id}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch product ${id}`);
    }
  },

  /**
   * Get a single product by slug
   */
  getBySlug: async (slug: string, lang?: string): Promise<Product> => {
    try {
      // Decode the slug if it's URL-encoded
      let decodedSlug = slug;
      try {
        decodedSlug = decodeURIComponent(slug);
      } catch (e) {
        console.warn('Failed to decode slug:', slug);
      }
      
      console.log('Fetching product - Original slug:', slug);
      console.log('Fetching product - Decoded slug:', decodedSlug);
      
      const params = lang ? { lang } : {};
      
      try {
        // Try the direct slug endpoint first
        const response = await wcApi.get<Product>(`/products/slug/${decodedSlug}`, { params });
        console.log('Product fetched successfully via slug endpoint');
        return response.data;
      } catch (error: any) {
        // If slug endpoint fails (likely due to Cyrillic characters), 
        // fall back to fetching all products and finding by slug
        console.warn('Slug endpoint failed, trying fallback method');
        
        const { products } = await productsApi.getAll({ 
          per_page: 100,
          search: decodedSlug,
          lang 
        });
        
        // Find exact match by slug
        const product = products.find(p => p.slug === decodedSlug);
        
        if (!product) {
          throw new Error(`Product with slug "${decodedSlug}" not found`);
        }
        
        console.log('Product found via fallback method');
        return product;
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return handleApiError(error, `Failed to fetch product with slug "${slug}"`);
    }
  },

  /**
   * Get product categories
   */
  getCategories: async (lang?: string) => {
    try {
      const params = lang ? { lang } : {};
      const response = await wcApi.get('/products/categories', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch categories');
    }
  },

  /**
   * Get promotional products
   */
  getPromotions: async (params?: ProductsQueryParams): Promise<{ products: Product[]; meta: PaginationMeta }> => {
    try {
      const response = await wcApi.get<Product[]>('/promotions', { params });
      const meta = extractPaginationMeta(response.headers, params?.page, params?.per_page);

      return {
        products: response.data,
        meta,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch promotions');
    }
  },

  /**
   * Get home page categories
   */
  getHomeCategories: async (lang?: string) => {
    try {
      const params = lang ? { lang } : {};
      const response = await wcApi.get('/home/categories', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch home categories');
    }
  },

  /**
   * Get featured products
   */
  getFeatured: async (params?: { per_page?: number; lang?: string }): Promise<Product[]> => {
    try {
      const response = await wcApi.get<Product[]>('/products/featured', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch featured products');
    }
  },
};

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export const authApi = {
  /**
   * Login user and store authentication token
   */
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    try {
      const response = await wcApi.post<{ token: string; user: User }>('/auth/login', credentials);
      const { token, user } = response.data;

      // Store token in secure cookie
      Cookies.set(AUTH_TOKEN_COOKIE, token, {
        expires: TOKEN_EXPIRY_DAYS,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return { token, user };
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  },

  /**
   * Logout user and clear authentication token
   */
  logout: async (): Promise<void> => {
    try {
      await wcApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove(AUTH_TOKEN_COOKIE);
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = Cookies.get(AUTH_TOKEN_COOKIE);
      if (!token) return null;

      const response = await wcApi.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<User> => {
    try {
      const response = await wpApi.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Registration failed');
    }
  },
};

// =============================================================================
// CART API
// =============================================================================

export interface AddToCartParams {
  productId: number;
  quantity?: number;
  variationId?: number;
  variationData?: Record<string, string>;
}

export const cartApi = {
  /**
   * Get current cart
   */
  getCart: async (): Promise<Cart> => {
    try {
      const response = await wcApi.get<Cart>('/cart');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch cart');
    }
  },

  /**
   * Get shipping information
   */
  getShipping: async () => {
    try {
      const response = await wcApi.get('/cart/shipping');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch shipping info');
    }
  },

  /**
   * Add item to cart
   */
  addToCart: async ({ productId, quantity = 1, variationId, variationData }: AddToCartParams): Promise<Cart> => {
    try {
      const requestData: Record<string, unknown> = {
        id: productId,
        quantity,
      };

      if (variationId) {
        requestData.variation_id = variationId;
      }

      if (variationData) {
        requestData.variation_data = variationData;
      }

      const response = await wcApi.post<Cart>('/cart/add-item', requestData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add item to cart');
    }
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (key: string, quantity: number): Promise<Cart> => {
    try {
      const response = await wcApi.post<Cart>('/cart/item', { key, quantity });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update cart item');
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (key: string): Promise<Cart> => {
    try {
      const response = await wcApi.delete<Cart>(`/cart/item/${key}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to remove item from cart');
    }
  },
};

// =============================================================================
// ORDER API
// =============================================================================

export interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
  items: Array<{
    id: number;
    quantity: number;
    name: string;
    price: string;
  }>;
}

export const orderApi = {
  /**
   * Create a new order
   */
  createOrder: async (orderData: OrderData) => {
    try {
      const response = await wcApi.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create order');
    }
  },
};

// =============================================================================
// DEALER API
// =============================================================================

export interface DealerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  postalCode?: string;
  taxNumber?: string;
  businessType: string;
  experience?: string;
  message?: string;
}

export interface DealerProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  business_type?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  tax_number?: string;
}

// =============================================================================
// CONTACT API
// =============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const contactApi = {
  /**
   * Submit contact form
   */
  submit: async (formData: ContactFormData) => {
    try {
      const response = await wcApi.post('/contact', formData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to send message');
    }
  },
};

// =============================================================================
// DEALER API
// =============================================================================

export const dealerApi = {
  /**
   * Register as a dealer
   */
  register: async (dealerData: DealerRegistrationData) => {
    try {
      const response = await wcApi.post('/dealer/register', dealerData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Dealer registration failed');
    }
  },

  /**
   * Get dealer products
   */
  getProducts: async (params?: ProductsQueryParams & { dealer_only?: boolean }) => {
    try {
      const response = await wcApi.get('/dealer/products', { params });
      const meta = extractPaginationMeta(response.headers, params?.page, params?.per_page);

      return {
        products: response.data,
        meta,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch dealer products');
    }
  },

  /**
   * Get dealer orders
   */
  getOrders: async (params?: { page?: number; per_page?: number; status?: string }) => {
    try {
      const response = await wcApi.get('/dealer/orders', { params });
      const meta = extractPaginationMeta(response.headers, params?.page, params?.per_page || 10);

      return {
        orders: response.data,
        meta,
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch dealer orders');
    }
  },

  /**
   * Update dealer profile
   */
  updateProfile: async (profileData: DealerProfileData) => {
    try {
      const response = await wcApi.put('/dealer/profile', profileData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update dealer profile');
    }
  },
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

/**
 * Unified API client
 */
export default {
  products: productsApi,
  auth: authApi,
  cart: cartApi,
  orders: orderApi,
  dealer: dealerApi,
} as const;
