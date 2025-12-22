import { useQuery } from 'react-query';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';

function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useQuery('all-users', async () => {
    const response = await api.get('/users');
    return response.data.data;
  });

  const { data: products, isLoading: productsLoading } = useQuery('all-products', async () => {
    const response = await api.get('/products');
    return response.data.data;
  });

  const { data: orders, isLoading: ordersLoading } = useQuery('all-orders', async () => {
    const response = await api.get('/orders');
    return response.data.data;
  });

  if (usersLoading || productsLoading || ordersLoading) return <Loader />;

  const totalRevenue = orders?.reduce((acc, order) => acc + order.pricing.total, 0) || 0;
  const activeProducts = products?.filter(p => p.status === 'active').length || 0;
  const pendingOrders = orders?.filter(o => o.orderStatus === 'pending').length || 0;

  const stats = [
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: Package,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Orders',
      value: orders?.length || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+18%'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-green-600 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Recent Users</h2>
          <div className="space-y-4">
            {users?.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                <span className="badge badge-info capitalize">{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {orders?.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{order.orderNumber}</div>
                  <div className="text-sm text-gray-600">{order.customer?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">
                    Rs. {order.pricing.total.toLocaleString()}
                  </div>
                  <span className={`badge badge-${order.orderStatus === 'delivered' ? 'success' : 'info'} text-xs`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <div className="card p-6 mt-8 border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-6 w-6 text-yellow-500" />
            <div>
              <div className="font-bold text-lg">Pending Orders</div>
              <p className="text-gray-600">
                You have {pendingOrders} pending orders that require attention
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;