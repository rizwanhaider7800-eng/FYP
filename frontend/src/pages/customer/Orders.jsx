import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';

function Orders() {
  const { data, isLoading } = useQuery('orders', async () => {
    const response = await api.get('/orders');
    return response.data.data;
  });

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