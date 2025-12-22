import { useQuery } from 'react-query';
import { Package, DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

function SellerDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery('seller-products', async () => {
    const response = await api.get('/products');
    return response.data.data;
  });

  const { data: orders, isLoading: ordersLoading } = useQuery('seller-orders', async () => {
    const response = await api.get('/orders');
    return response.data.data;
  });

  const { data: lowStock } = useQuery('low-stock', async () => {
    const response = await api.get('/products/low-stock');
    return response.data.data;
  });

  if (productsLoading || ordersLoading) return <Loader />;

  const stats = [
    {
      title: 'Total Products',
      value: products?.length || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: orders?.length || 0,
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      title: 'Revenue',
      value: `Rs. ${orders?.reduce((acc, order) => acc + order.pricing.total, 0).toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Low Stock Items',
      value: lowStock?.length || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link to="/seller/products" className="btn-primary">
          Manage Products
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link to="/seller/orders" className="text-primary-600 hover:text-primary-700 font-semibold">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{order.customer?.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`badge badge-${order.orderStatus === 'delivered' ? 'success' : 'info'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    Rs. {order.pricing.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock?.length > 0 && (
        <div className="card p-6 border-l-4 border-red-500">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold">Low Stock Alert</h2>
          </div>
          <div className="space-y-3">
            {lowStock.slice(0, 5).map((product) => (
              <div key={product._id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    Current Stock: {product.inventory.stock} {product.unit}
                  </div>
                </div>
                <Link to="/seller/products" className="btn-outline text-sm px-3 py-1">
                  Update
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;