import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiFileText, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useNotifications } from '@/components/Notifications/NotificationSystem';
import { dealerApi } from '@/utils/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface DealerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  taxNumber: string;
  businessType: string;
  experience: string;
  message: string;
}

const DealerRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<DealerRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    taxNumber: '',
    businessType: '',
    experience: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DealerRegistrationData>>({});
  const { showSuccess, showError } = useNotifications();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof DealerRegistrationData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DealerRegistrationData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('common.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('common.lastNameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('common.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.emailInvalid');
    }
    if (!formData.phone.trim()) newErrors.phone = t('common.phoneRequired');
    if (!formData.company.trim()) newErrors.company = t('common.companyName') + ' ' + t('common.emailRequired').toLowerCase();
    if (!formData.address.trim()) newErrors.address = t('common.addressRequired');
    if (!formData.city.trim()) newErrors.city = t('common.cityRequired');
    if (!formData.businessType) newErrors.businessType = t('common.selectType');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Send dealer registration request
      await dealerApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        taxNumber: formData.taxNumber,
        businessType: formData.businessType,
        experience: formData.experience,
        message: formData.message,
      });
      
      showSuccess(
        t('common.applicationSent'),
        t('common.applicationSentDesc')
      );
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        postalCode: '',
        taxNumber: '',
        businessType: '',
        experience: '',
        message: '',
      });
    } catch (error) {
      showError(
        t('common.registrationError'),
        t('common.registrationErrorDesc')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypes = [
    { value: 'retail', label: t('common.retail') },
    { value: 'wholesale', label: t('common.wholesale') },
    { value: 'gym', label: t('common.gym') },
    { value: 'pharmacy', label: t('common.pharmacy') },
    { value: 'supplement_store', label: t('common.supplementStore') },
    { value: 'online', label: t('common.onlineSales') },
    { value: 'other', label: t('common.other') }
  ];

  return (
    <>
      <Head>
        <title>Регистрација за соработник - FitBody.mk</title>
        <meta name="description" content="Станете соработник на FitBody.mk и добијте пристап до специјални цени и ексклузивни производи." />
      </Head>

      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/dealer/login" className="text-blue-400 hover:text-blue-300 flex items-center space-x-2">
                <FiArrowLeft size={20} />
                <span>{t('common.backToLogin')}</span>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('common.becomeDealer')}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('common.joinDealerNetwork')}
            </p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">Бенефити за соработники</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '💰', title: 'Специјални цени', desc: 'До 30% попуст од малопродажните цени' },
                { icon: '📦', title: 'Приоритетна достава', desc: 'Брза и бесплатна достава за поголеми нарачки' },
                { icon: '🎯', title: 'Маркетинг поддршка', desc: 'Материјали и поддршка за промоција' }
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Апликација за соработник</h2>
            
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiUser className="mr-2" />
                Лични податоци
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Име *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.firstName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Вашето име"
                  />
                  {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Презиме *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.lastName ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Вашето презиме"
                  />
                  {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Емаил *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Телефон *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="070 123 456"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiHome className="mr-2" />
                Бизнис информации
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Име на компанија *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.company ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Име на вашата компанија"
                  />
                  {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Тип на бизнис *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.businessType ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Изберете тип</option>
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.businessType && <p className="text-red-400 text-sm mt-1">{errors.businessType}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Даночен број</label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Даночен број на компанијата"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Адреса
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Адреса *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Улица и број"
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Град *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Скопје"
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Поштенски код</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiFileText className="mr-2" />
                Дополнителни информации
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Искуство во продажба</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Изберете</option>
                    <option value="none">Немам искуство</option>
                    <option value="1-2">1-2 години</option>
                    <option value="3-5">3-5 години</option>
                    <option value="5+">Повеќе од 5 години</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Дополнителна порака</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Кажете ни нешто повеќе за вашиот бизнис и зошто сакате да станете наш соработник..."
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Се испраќа...</span>
                </>
              ) : (
                <>
                  <FiCheck size={20} />
                  <span>ИСПРАТИ АПЛИКАЦИЈА</span>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </>
  );
};

export default DealerRegisterPage;