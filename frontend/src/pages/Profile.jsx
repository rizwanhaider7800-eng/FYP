import { useState } from 'react';
import { User, MapPin, Briefcase, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

function Profile() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    businessName: user?.businessDetails?.businessName || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        businessDetails: {
          businessName: formData.businessName
        }
      });
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data.data);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <span className="badge badge-info capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-outline"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-semibold">Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {(user?.role === 'wholesaler' || user?.role === 'supplier') && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-semibold">Business Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {editing && (
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;