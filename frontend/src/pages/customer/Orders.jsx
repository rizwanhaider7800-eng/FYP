import { useQuery } from 'react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Package, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';

function Orders() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const [verifying, setVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (sessionId && !verifying && !verifiedOrder && !hasVerified.current) {
      hasVerified.current = true;
      verifyStripePayment();
    }
  }, [sessionId]);

  const verifyStripePayment = async () => {
    setVerifying(true);
    try {
      const response = await api.post('/orders/verify-payment', { sessionId });
      clearCart();
      setVerifiedOrder(response.data.data);
      toast.success('Payment successful! Your order has been placed.', {
        duration: 5000,
        icon: '🎉'
      });
      // Don't remove session_id immediately - keep showing success page
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.response?.data?.message || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const { data, isLoading, refetch } = useQuery('orders', async () => {
    const response = await api.get('/orders');
    return response.data.data;
  }, {
    enabled: !verifying,
    refetchOnWindowFocus: false
  });

  // Refetch orders after payment verification
  useEffect(() => {
    if (verifiedOrder && !verifying) {
      refetch();
    }
  }, [verifiedOrder, verifying]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-info';
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (verifiedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Thank you for your order. Your payment has been processed successfully.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-lg">#{verifiedOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-lg text-green-600">Rs. {verifiedOrder.pricing.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-semibold text-green-600">Paid</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className="font-semibold capitalize">{verifiedOrder.orderStatus}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Order Items</h3>
            <div className="space-y-2">
              {verifiedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                  <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to={`/orders/${verifiedOrder._id}`} className="btn-primary">
              View Order Details
            </Link>
            <Link to="/products" className="btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {data?.length > 0 ? (
        <div className="space-y-4">
          {data.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-6 block hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                    <span className={`badge ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    Rs. {order.pricing.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">{order.items.length} items</div>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 min-w-max">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{item.product?.name || 'Product'}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="flex items-center text-gray-500">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
          <Link to="/products" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default Orders;