import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('notifications', async () => {
    const response = await api.get('/notifications');
    return response.data;
  });

  const markAsReadMutation = useMutation(
    async (id) => await api.put(`/notifications/${id}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        toast.success('Marked as read');
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => await api.delete(`/notifications/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        toast.success('Notification deleted');
      }
    }
  );

  const getNotificationIcon = (type) => {
    const icons = {
      order: '📦',
      payment: '💳',
      stock: '⚠️',
      bid: '🔨',
      chat: '💬',
      promotion: '🎉',
      system: '⚙️',
    };
    return icons[type] || '🔔';
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {data?.unreadCount > 0 && (
              <p className="text-gray-600">{data.unreadCount} unread notifications</p>
            )}
          </div>
        </div>
      </div>

      {data?.data?.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((notification) => (
            <div
              key={notification._id}
              className={`card p-4 ${!notification.isRead ? 'border-l-4 border-primary-600' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex space-x-4 flex-grow">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-grow">
                    <h3 className="font-semibold mb-1">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification._id)}
                      className="text-primary-600 hover:text-primary-700"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(notification._id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No notifications</h2>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}

export default Notifications;