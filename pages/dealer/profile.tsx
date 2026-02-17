import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiBriefcase, FiSave, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '@/utils/api';

const DealerProfile: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    business_type: '',
    address: '',
    city: '',
    postal_code: '',
    tax_number: '',
  });

  useEffect(() => {
    if (!loading && (!user || !user.is_dealer)) {
      router.push('/dealer/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.dealer_phone || '',
        company: user.dealer_company || '',
        business_type: user.dealer_business_type || '',
        address: user.dealer_address || '',
        city: user.dealer_city || '',
        postal_code: user.dealer_postal_code || '',
        tax_number: user.dealer_tax_number || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await api.dealer.updateProfile(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Профилот е успешно ажуриран!' });
        setIsEditing(false);
        
        // Update the user context if available
        // You might want to refresh the user data here
        window.location.reload(); // Simple way to refresh user data
      } else {
        setMessage({ type: 'error', text: 'Грешка при зачувување на профилот.' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Грешка при зачувување на профилот. Обидете се повторно.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.dealer_phone || '',
        company: user.dealer_company || '',
        business_type: user.dealer_business_type || '',
        address: user.dealer_address || '',
        city: user.dealer_city || '',
        postal_code: user.dealer_postal_code || '',
        tax_number: user.dealer_tax_number || '',
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'suspended': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрен';
      case 'pending': return 'Во разгледување';
      case 'rejected': return 'Одбиен';
      case 'suspended': return 'Суспендиран';
      default: return 'Непознат';
    }
  };

  const businessTypeOptions = [
    { value: 'retail', label: 'Малопродажба' },
    { value: 'wholesale', label: 'Големопродажба' },
    { value: 'gym', label: 'Фитнес центар' },
    { value: 'pharmacy', label: 'Аптека' },
    { value: 'supplement_store', label: 'Продавница за додатоци' },
    { value: 'online', label: 'Онлајн продажба' },
    { value: 'other', label: 'Друго' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !user.is_dealer) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Мој профил - FitBody.mk</title>
        <meta name="description" content="Управувајте со вашиот соработникски профил на FitBody.mk." />
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
              <Link href="/dealer/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft size={20} />
                  <span>Назад кон табла</span>
                </motion.button>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Мој профил
                </h1>
                <p className="text-gray-300">Управувајте со вашите лични и деловни информации</p>
              </div>
              
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiEdit3 size={16} />
                  <span>Уреди профил</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
                <span>{message.text}</span>
              </div>
            </motion.div>
          )}

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="text-brandGold" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-gray-400 mb-3">{user.dealer_company}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.dealer_status || 'pending')}`}>
                    {getStatusText(user.dealer_status || 'pending')}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FiMail size={16} className="text-gray-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FiBriefcase size={16} className="text-gray-500" />
                    <span className="text-sm">{user.dealer_business_type}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FiHome size={16} className="text-gray-500" />
                    <span className="text-sm">{user.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">Лични информации</h2>
                
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Име
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Презиме
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Емаил адреса
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="border-t border-gray-800 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Деловни информации</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Име на компанија
                        </label>
                        <div className="relative">
                          <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Тип на бизнис
                        </label>
                        <div className="relative">
                          <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                          <select
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                          >
                            <option value="">Изберете тип</option>
                            {businessTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Адреса
                          </label>
                          <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Град
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Поштенски код
                          </label>
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Даночен број
                          </label>
                          <input
                            type="text"
                            name="tax_number"
                            value={formData.tax_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-800">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                      >
                        <FiSave size={16} />
                        <span>{isSaving ? 'Се зачувува...' : 'Зачувај промени'}</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                      >
                        <FiX size={16} />
                        <span>Откажи</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealerProfile;