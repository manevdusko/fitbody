import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiTruck, FiCreditCard } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { orderApi } from '@/utils/api';
import { useNotifications } from '@/components/Notifications/NotificationSystem';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, loading, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { showOrderSuccess, showError } = useNotifications();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  // Auto-fill form with user data (especially for dealers)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || prev.firstName,
        lastName: user.last_name || prev.lastName,
        email: user.email || prev.email,
        phone: user.dealer_phone || prev.phone,
        address: user.dealer_address || prev.address,
        city: user.dealer_city || prev.city,
        postalCode: user.dealer_postal_code || prev.postalCode,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('common.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('common.lastNameRequired');
    // Email is now optional, but if provided, it should be valid
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.emailInvalid');
    }
    if (!formData.phone.trim()) newErrors.phone = t('common.phoneRequired');
    if (!formData.address.trim()) newErrors.address = t('common.addressRequired');
    if (!formData.city.trim()) newErrors.city = t('common.cityRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Create the order in WooCommerce
      const orderResponse = await orderApi.createOrder({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        notes: formData.notes,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        }))
      });

      // Show success notification with order details
      showOrderSuccess(
        orderResponse.order_number,
        parseFloat(orderResponse.total).toLocaleString()
      );
      
      // Clear the cart
      clearCart();
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      let errorMessage = t('common.orderError');
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        
        if (axiosError.response?.data?.message) {
          errorMessage = `Грешка: ${axiosError.response.data.message}`;
        } else if (axiosError.response?.data?.code) {
          errorMessage = `Грешка: ${axiosError.response.data.code}`;
        }
      }
      
      showError('Грешка при нарачка', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="text-white text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-4">{t('common.cartEmpty')}</h1>
            <p className="text-gray-400 mb-8">{t('common.addProductsToStart')}</p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-4 text-lg font-semibold"
              >
                {t('common.browseProducts')}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Нарачка - FitBody.mk</title>
        <meta name="description" content="Завршете ја вашата нарачка и внесете ги вашите податоци за достава." />
      </Head>

      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/cart" className="text-blue-400 hover:text-blue-300 flex items-center space-x-2">
                <FiArrowLeft size={20} />
                <span>{t('pages.checkout.backToCart')}</span>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('pages.checkout.title')}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800"
              >
                <h2 className="text-2xl font-bold text-white mb-6">{t('pages.checkout.shippingDetails')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.nameLabel')}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.firstName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                      placeholder={t('pages.checkout.namePlaceholder')}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.surnameLabel')}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.lastName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                      placeholder={t('pages.checkout.surnamePlaceholder')}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.emailLabel')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                      placeholder={t('pages.checkout.emailPlaceholder')}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                      placeholder={t('pages.checkout.phonePlaceholder')}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    {t('pages.checkout.addressLabel')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                    placeholder={t('pages.checkout.addressPlaceholder')}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.cityLabel')}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500`}
                      placeholder={t('pages.checkout.cityPlaceholder')}
                    />
                    {errors.city && (
                      <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      {t('pages.checkout.postalCodeLabel')}
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      placeholder={t('pages.checkout.postalCodePlaceholder')}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    {t('pages.checkout.notesLabel')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    placeholder={t('pages.checkout.notesPlaceholder')}
                  />
                </div>

              {/* Dealer Info */}
              {user?.is_dealer && user?.dealer_status === 'approved' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <FiCheck className="text-blue-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-blue-400 font-semibold mb-2">{t('pages.checkout.discountApplied')}</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        {t('pages.checkout.dealerDiscount')}
                      </p>
                      <p className="text-gray-300 text-sm">
                        <strong>{t('pages.checkout.company')}:</strong> {user.dealer_company}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <FiTruck className="text-blue-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold mb-2">{t('pages.checkout.deliveryInfo')}</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>{t('pages.cart.delivery')}:</strong> {t('pages.checkout.deliveryDescription')}
                      </p>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>{t('pages.checkout.deliveryPrice')}</strong>
                      </p>
                      <p className="text-gray-300 text-sm">
                        <strong>{t('pages.checkout.paymentMethod')}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>{t('pages.contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={20} />
                      <span>{t('pages.checkout.confirmOrder')}</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900 rounded-lg p-6 border border-gray-800 h-fit sticky top-24"
            >
              <h3 className="text-xl font-bold text-white mb-6">{t('pages.cart.orderSummary')}</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.key} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image?.src ? (
                        <img
                          src={item.image.src}
                          alt={item.image.alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">IMG</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      {/* Variation subtitle */}
                      {item.variation && Object.keys(item.variation).length > 0 && (
                        <p className="text-xs text-gray-400 mb-1">
                          {Object.entries(item.variation).map(([key, value]) => value).join(', ')}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs">{t('pages.cart.quantity')}: {item.quantity}</p>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      MKD {parseFloat(item.total || '0').toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t border-gray-700 pt-4">
                <div className="flex justify-between text-gray-300">
                  <span>{t('pages.cart.total')}:</span>
                  <span>MKD {parseFloat(cart?.totals?.subtotal || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>{t('pages.cart.delivery')}:</span>
                  <span>
                    {cart?.shipping ? (
                      cart.shipping.cost > 0 ? 
                        `MKD ${cart.shipping.cost.toLocaleString()}` : 
                        t('pages.cart.free')
                    ) : (
                      t('pages.cart.calculating')
                    )}
                  </span>
                </div>
                {cart?.shipping?.description && (
                  <div className="text-xs text-gray-400">
                    {cart.shipping.description}
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>{t('pages.cart.total')}:</span>
                    <span>
                      MKD {(
                        parseFloat(cart?.totals?.subtotal || '0') + 
                        (cart?.shipping?.cost || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiCreditCard className="text-green-400 mt-1" size={16} />
                  <div>
                    <p className="text-green-400 font-semibold text-sm mb-1">{t('pages.checkout.paymentOnDelivery')}</p>
                    <p className="text-gray-300 text-xs">
                      {t('pages.checkout.paymentDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;