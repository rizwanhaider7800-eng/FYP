import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Tag, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

function ManageCoupons() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    applicableFor: 'all',
    validFrom: '',
    validUntil: '',
    usageLimit: ''
  });

  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery('coupons', async () => {
    const response = await api.get('/coupons');
    return response.data.data;
  });

  const createMutation = useMutation(
    async (data) => await api.post('/coupons', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('coupons');
        toast.success('Coupon created successfully');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create coupon');
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => await api.delete(`/coupons/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('coupons');
        toast.success('Coupon deleted successfully');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: '',
      maxDiscount: '',
      applicableFor: 'all',
      validFrom: '',
      validUntil: '',
      usageLimit: ''
    });
    setShowModal(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Tag className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Manage Coupons</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((coupon) => (
          <div key={coupon._id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {coupon.code}
                </div>
                <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(coupon._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `Rs. ${coupon.discountValue}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Order:</span>
                <span className="font-semibold">Rs. {coupon.minOrderValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage:</span>
                <span className="font-semibold">
                  {coupon.usedCount} / {coupon.usageLimit || '∞'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-semibold">
                  {new Date(coupon.validUntil).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`badge ${coupon.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Create New Coupon</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className="input-field"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="input-field"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Order Value
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount (for percentage)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Applicable For
                    </label>
                    <select
                      value={formData.applicableFor}
                      onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value })}
                      className="input-field"
                    >
                      <option value="all">All Users</option>
                      <option value="retail">Retail Only</option>
                      <option value="wholesale">Wholesale Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      min="1"
                      className="input-field"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading}
                    className="btn-primary"
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCoupons;