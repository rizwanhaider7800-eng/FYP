import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

function SellerOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery('seller-orders', async () => {
    const response = await api.get('/orders');
    return response.data.data;
  });

  const updateStatusMutation = useMutation(
    async ({ orderId, status }) => {
      return await api.put(`/orders/${orderId}/status`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seller-orders');
        toast.success('Order status updated');
        setSelectedOrder(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!newStatus || !selectedOrder) return;

    updateStatusMutation.mutate({
      orderId: selectedOrder,
      status: newStatus
    });
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

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{order.customer?.name}</div>
                      <div className="text-sm text-gray-600">{order.customer?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    Rs. {order.pricing.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order._id);
                        setNewStatus(order.orderStatus);
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isLoading}
                  className="btn-primary"
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOrders;