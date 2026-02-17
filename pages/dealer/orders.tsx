import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiCalendar, FiDollarSign, FiEye, FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import api from '@/utils/api';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: {
    id: number;
    src: string;
    alt: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  date_created: string;
  total: number;
  currency: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    postcode: string;
  };
  items: OrderItem[];
}

const DealerOrders: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.is_dealer)) {
      router.push('/dealer/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.is_dealer) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.dealer.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      setError('Грешка при вчитување на нарачките');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'on-hold': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'refunded': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завршена';
      case 'processing': return 'Во обработка';
      case 'on-hold': return 'На чекање';
      case 'cancelled': return 'Откажана';
      case 'refunded': return 'Рефундирана';
      case 'failed': return 'Неуспешна';
      case 'pending': return 'Во очекување';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck size={16} />;
      case 'processing': return <FiClock size={16} />;
      case 'on-hold': return <FiClock size={16} />;
      case 'cancelled': return <FiX size={16} />;
      case 'refunded': return <FiArrowLeft size={16} />;
      case 'failed': return <FiX size={16} />;
      default: return <FiPackage size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mk-MK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !user.is_dealer) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Мои нарачки - FitBody.mk</title>
        <meta name="description" content="Прегледајте ги вашите претходни нарачки како соработник на FitBody.mk." />
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
                  Мои нарачки
                </h1>
                <p className="text-gray-300">Прегледајте ги вашите претходни нарачки и нивниот статус</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{orders.length}</div>
                  <div className="text-sm text-gray-400">Вкупно нарачки</div>
                </div>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FiPackage size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Немате нарачки</h3>
              <p className="text-gray-400 mb-6">Кога ќе направите нарачка, таа ќе се појави овде</p>
              <Link href="/dealer/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Разгледај производи
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                          <FiPackage className="text-blue-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Нарачка #{order.order_number}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <FiCalendar size={14} />
                            <span>{formatDate(order.date_created)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-lg font-bold text-blue-400 mt-1">
                          <FiDollarSign size={16} />
                          <span>MKD {parseFloat(order.total.toString()).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Адреса за достава</h4>
                          <div className="text-white text-sm">
                            <p>{order.billing.first_name} {order.billing.last_name}</p>
                            <p>{order.billing.address_1}</p>
                            <p>{order.billing.city} {order.billing.postcode}</p>
                            <p>{order.billing.phone}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Производи ({order.items.length})</h4>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center justify-between text-sm">
                                <span className="text-white truncate">{item.name}</span>
                                <span className="text-gray-400">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-gray-400 text-sm">+{order.items.length - 3} повеќе производи</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{order.items.length} производи</span>
                          <span>•</span>
                          <span>MKD {parseFloat(order.total.toString()).toLocaleString()}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FiEye size={16} />
                          <span>Детали</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Детали за нарачка #{selectedOrder.order_number}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(selectedOrder.status).replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', '')}`}>
                        {getStatusIcon(selectedOrder.status)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{getStatusText(selectedOrder.status)}</p>
                        <p className="text-gray-400 text-sm">{formatDate(selectedOrder.date_created)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">
                        MKD {parseFloat(selectedOrder.total.toString()).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Производи</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image?.src ? (
                              <img
                                src={item.image.src}
                                alt={item.image.alt}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                <FiPackage className="text-gray-400" size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-gray-400 text-sm">
                              MKD {parseFloat(item.price.toString()).toLocaleString()} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              MKD {parseFloat(item.total.toString()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Адреса за достава</h3>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-white">
                        <p className="font-medium">{selectedOrder.billing.first_name} {selectedOrder.billing.last_name}</p>
                        <p>{selectedOrder.billing.address_1}</p>
                        <p>{selectedOrder.billing.city} {selectedOrder.billing.postcode}</p>
                        <p>{selectedOrder.billing.phone}</p>
                        <p>{selectedOrder.billing.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default DealerOrders;