import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

function ManageProducts() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'cement',
    unit: 'bag',
    retailPrice: '',
    wholesalePrice: '',
    minWholesaleQuantity: '100',
    stock: '',
    lowStockThreshold: '20',
    brand: '',
    specifications: {}
  });
  const [images, setImages] = useState([]);

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery('seller-products', async () => {
    const response = await api.get('/products');
    return response.data.data;
  });

  const createMutation = useMutation(
    async (data) => {
      const formDataObj = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'pricing' || key === 'inventory' || key === 'specifications') {
          formDataObj.append(key, JSON.stringify(data[key]));
        } else {
          formDataObj.append(key, data[key]);
        }
      });

      images.forEach((file) => {
        formDataObj.append('images', file);
      });

      return await api.post('/products', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seller-products');
        toast.success('Product created successfully');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const formDataObj = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'pricing' || key === 'inventory' || key === 'specifications') {
          formDataObj.append(key, JSON.stringify(data[key]));
        } else {
          formDataObj.append(key, data[key]);
        }
      });

      images.forEach((file) => {
        formDataObj.append('images', file);
      });

      return await api.put(`/products/${id}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seller-products');
        toast.success('Product updated successfully');
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => await api.delete(`/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seller-products');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      unit: formData.unit,
      pricing: {
        retailPrice: Number(formData.retailPrice),
        wholesalePrice: Number(formData.wholesalePrice),
        minWholesaleQuantity: Number(formData.minWholesaleQuantity)
      },
      inventory: {
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold)
      },
      specifications: {
        brand: formData.brand
      }
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      retailPrice: product.pricing.retailPrice,
      wholesalePrice: product.pricing.wholesalePrice,
      minWholesaleQuantity: product.pricing.minWholesaleQuantity,
      stock: product.inventory.stock,
      lowStockThreshold: product.inventory.lowStockThreshold,
      brand: product.specifications?.brand || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'cement',
      unit: 'bag',
      retailPrice: '',
      wholesalePrice: '',
      minWholesaleQuantity: '100',
      stock: '',
      lowStockThreshold: '20',
      brand: ''
    });
    setImages([]);
    setEditingProduct(null);
    setShowModal(false);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Retail Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Wholesale Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products?.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-info capitalize">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    Rs. {product.pricing.retailPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    Rs. {product.pricing.wholesalePrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{product.inventory.stock}</div>
                    {product.inventory.stock <= product.inventory.lowStockThreshold && (
                      <div className="text-xs text-red-600">Low Stock!</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${product.inventory.inStock ? 'badge-success' : 'badge-danger'}`}>
                      {product.inventory.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="cement">Cement</option>
                      <option value="bricks">Bricks</option>
                      <option value="steel">Steel</option>
                      <option value="wood">Wood</option>
                      <option value="tiles">Tiles</option>
                      <option value="sand">Sand</option>
                      <option value="gravel">Gravel</option>
                      <option value="paint">Paint</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field"
                    >
                      <option value="kg">Kilogram</option>
                      <option value="ton">Ton</option>
                      <option value="piece">Piece</option>
                      <option value="bag">Bag</option>
                      <option value="box">Box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retail Price
                    </label>
                    <input
                      type="number"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wholesale Price
                    </label>
                    <input
                      type="number"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Wholesale Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.minWholesaleQuantity}
                      onChange={(e) => setFormData({ ...formData, minWholesaleQuantity: e.target.value })}
                      required
                      min="1"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      min="0"
                      className="input-field"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(Array.from(e.target.files))}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload up to 5 images (JPEG, PNG, GIF)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="btn-primary"
                  >
                    {(createMutation.isLoading || updateMutation.isLoading)
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
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

export default ManageProducts;