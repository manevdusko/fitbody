import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook, FiClock, FiSend, FiUser, FiMessageSquare, FiMessageCircle } from 'react-icons/fi';
import { ContactSEO } from '@/components/SEO/SEOHead';
import { LocalBusinessSchema, BreadcrumbSchema } from '@/components/SEO/StructuredData';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const contactInfo = [
    {
      icon: FiPhone,
      title: t('pages.contact.phoneDescription'),
      value: '075 55 55 11',
      href: 'tel:+38975555511',
      description: t('pages.contact.phoneDescription')
    },
    {
      icon: FiMessageCircle,
      title: t('pages.about.viberTelegram'),
      value: '070 213 533',
      href: 'tel:+389070213533',
      description: t('pages.about.viberTelegramDescription')
    },
    {
      icon: FiMail,
      title: t('pages.about.emailInfo'),
      value: 'fitbody.mk@icloud.com',
      href: 'mailto:fitbody.mk@icloud.com',
      description: t('pages.contact.emailDescription')
    },
    {
      icon: FiMapPin,
      title: t('pages.about.locationInfo'),
      value: 'Кочани, Македонија',
      href: 'https://maps.google.com/?q=Kočani,Macedonia',
      description: t('pages.contact.locationDescription')
    },
    {
      icon: FiClock,
      title: t('pages.contact.workingHours'),
      value: t('pages.contact.workingHoursValue'),
      href: null,
      description: t('pages.contact.workingHoursDescription')
    }
  ];

  const socialLinks = [
    {
      icon: FiInstagram,
      name: 'Instagram',
      url: 'https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng==',
      handle: '@goldtouchnutrition.mk',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiFacebook,
      name: 'Facebook',
      url: 'https://www.facebook.com/fitbody.mk',
      handle: 'fitbody.mk',
      color: 'from-orange-600 to-orange-500'
    }
  ];
  
  const breadcrumbs = [
    { name: t('navigation.home'), url: '/' },
    { name: t('pages.contact.title'), url: '/contact' }
  ];

  return (
    <>
      {/* SEO */}
      <ContactSEO />
      <LocalBusinessSchema />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />

      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('pages.contact.title').split(' ')[0]} <span className="text-orange-500">{t('pages.contact.title').split(' ')[1]}</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('pages.contact.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-8">{t('pages.contact.contactInfo')}</h2>
              
              {/* Contact Cards */}
              <div className="space-y-6 mb-10">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-orange-500/10 p-3 rounded-lg">
                        <item.icon className="text-brandGold" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="text-brandGold hover:text-orange-300 font-medium transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-brandGold font-medium">{item.value}</p>
                        )}
                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6">{t('pages.contact.followUs')}</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r ${social.color} p-4 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-3">
                        <social.icon size={24} />
                        <div>
                          <div className="font-semibold">{social.name}</div>
                          <div className="text-sm opacity-90">{social.handle}</div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900 rounded-lg p-8 border border-gray-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('pages.contact.sendMessage')}</h2>
              
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6"
                >
                  <p className="text-green-400 font-medium">
                    {t('pages.contact.successMessage')}
                  </p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
                >
                  <p className="text-red-400 font-medium">
                    {t('pages.contact.errorMessage')}
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiUser className="inline mr-2" size={16} />
                      {t('pages.contact.nameLabel')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder={t('pages.contact.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiMail className="inline mr-2" size={16} />
                      {t('pages.contact.emailLabel')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder={t('pages.contact.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiPhone className="inline mr-2" size={16} />
                      {t('pages.contact.phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder={t('pages.contact.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiMessageSquare className="inline mr-2" size={16} />
                      {t('pages.contact.subjectLabel')}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">{t('pages.contact.selectSubject')}</option>
                      <option value="general">{t('pages.contact.generalQuestion')}</option>
                      <option value="product">{t('pages.contact.productQuestion')}</option>
                      <option value="dealer">{t('pages.contact.becomeDealer')}</option>
                      <option value="support">{t('pages.contact.technicalSupport')}</option>
                      <option value="complaint">{t('pages.contact.complaint')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('pages.contact.messageLabel')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    placeholder={t('pages.contact.messagePlaceholder')}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>{t('pages.contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <FiSend size={20} />
                      <span>{t('pages.contact.sendButton')}</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('pages.contact.faqTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: t('pages.contact.faqQuestion1'),
                  answer: t('pages.contact.faqAnswer1')
                },
                {
                  question: t('pages.contact.faqQuestion2'),
                  answer: t('pages.contact.faqAnswer2')
                },
                {
                  question: t('pages.contact.faqQuestion3'),
                  answer: t('pages.contact.faqAnswer3')
                },
                {
                  question: t('pages.contact.faqQuestion4'),
                  answer: t('pages.contact.faqAnswer4')
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <h3 className="text-white font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;