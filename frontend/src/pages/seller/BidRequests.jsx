import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Gavel, Calendar, Package } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

function BidRequests() {
  const [selectedBid, setSelectedBid] = useState(null);
  const [bidData, setBidData] = useState({
    price: '',
    estimatedDelivery: '',
    message: ''
  });
  
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery('bid-requests', async () => {
    const response = await api.get('/bids');
    return response.data.data;
  });

  const submitBidMutation = useMutation(
    async (data) => {
      return await api.post(`/bids/${selectedBid}/submit`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bid-requests');
        toast.success('Bid submitted successfully');
        setSelectedBid(null);
        setBidData({ price: '', estimatedDelivery: '', message: '' });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit bid');
      }
    }
  );

  const handleSubmitBid = (e) => {
    e.preventDefault();
    submitBidMutation.mutate(bidData);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'badge-success',
      closed: 'badge-warning',
      awarded: 'badge-info',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-info';
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Gavel className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold">Bid Requests</h1>
      </div>

      {bids?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bids.map((bid) => (
            <div key={bid._id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{bid.product?.name}</h3>
                  <span className={`badge ${getStatusColor(bid.status)}`}>
                    {bid.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {bid.quantity} units
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Delivery needed by: {new Date(bid.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">
                    Expires: {new Date(bid.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Description:</div>
                <p className="text-gray-600 text-sm">{bid.description}</p>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Customer: {bid.customer?.name}
                </div>
              </div>

              {bid.bids?.length > 0 && (
                <div className="mb-4 border-t pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Current Bids ({bid.bids.length}):
                  </div>
                  <div className="space-y-2">
                    {bid.bids.slice(0, 3).map((b, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">Rs. {b.price.toLocaleString()}</span>
                        <span className={`badge ${b.status === 'accepted' ? 'badge-success' : 'badge-info'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bid.status === 'open' && (
                <button
                  onClick={() => setSelectedBid(bid._id)}
                  className="w-full btn-primary"
                >
                  Submit Bid
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Gavel className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Bid Requests</h2>
          <p className="text-gray-600">There are no active bid requests at the moment</p>
        </div>
      )}

      {/* Submit Bid Modal */}
      {selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Submit Your Bid</h2>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price (Rs.) *
                </label>
                <input
                  type="number"
                  value={bidData.price}
                  onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                  required
                  min="0"
                  className="input-field"
                  placeholder="Enter your best price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date *
                </label>
                <input
                  type="date"
                  value={bidData.estimatedDelivery}
                  onChange={(e) => setBidData({ ...bidData, estimatedDelivery: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={bidData.message}
                  onChange={(e) => setBidData({ ...bidData, message: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Additional details about your bid..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBid(null);
                    setBidData({ price: '', estimatedDelivery: '', message: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitBidMutation.isLoading}
                  className="btn-primary"
                >
                  {submitBidMutation.isLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BidRequests;