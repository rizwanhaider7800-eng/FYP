import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Download, Truck, Package, MapPin, CreditCard, XCircle } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading, refetch } = useQuery(['order', id], async () => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  });

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      paid: 'badge-success',
      failed: 'badge-danger',
      refunded: 'badge-info',
    };
    return colors[status] || 'badge-info';
  };

  if (isLoading) return <Loader />;
  if (!order) return <div>Order not found</div>;

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Details</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={handleDownloadInvoice}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Invoice</span>
          </button>
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              className="btn-secondary flex items-center space-x-2 text-red-600"
            >
              <XCircle className="h-4 w-4" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Order Status</h2>
              <span className={`badge ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              {order.statusHistory?.map((status, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    <Package className={`h-4 w-4 ${index === 0 ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold capitalize">{status.status}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(status.updatedAt).toLocaleString()}
                    </div>
                    {status.note && (
                      <div className="text-sm text-gray-600 mt-1">{status.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.product?.name || 'Product'}</h3>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} × Rs. {item.price.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className={`badge ${item.priceType === 'wholesale' ? 'badge-info' : 'badge-success'}`}>
                        {item.priceType}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-primary-600">
                    Rs. {(item.quantity * item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="text-gray-700">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.tracking?.trackingNumber && (
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">Tracking Information</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier:</span>
                  <span className="font-semibold">{order.tracking.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-semibold">{order.tracking.trackingNumber}</span>
                </div>
                {order.tracking.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery:</span>
                    <span className="font-semibold">
                      {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs. {order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">Rs. {order.pricing.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {order.pricing.shippingCost === 0 ? 'FREE' : `Rs. ${order.pricing.shippingCost}`}
                </span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-Rs. {order.pricing.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">Rs. {order.pricing.total.toLocaleString()}</span>
              </div>
            </div>

            {order.couponApplied && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-sm font-semibold text-green-800">Coupon Applied</div>
                <div className="text-sm text-green-700">{order.couponApplied.code}</div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold capitalize">{order.paymentDetails.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`badge ${getPaymentStatusColor(order.paymentDetails.status)}`}>
                  {order.paymentDetails.status}
                </span>
              </div>
              {order.paymentDetails.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{order.paymentDetails.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Customer</h2>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-semibold">{order.customer?.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-semibold">{order.customer?.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-semibold">{order.customer?.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;