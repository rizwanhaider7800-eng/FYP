import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ShoppingCart, Star, Minus, Plus, Package, Truck, Shield } from 'lucide-react';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCartStore();

  const { data: product, isLoading } = useQuery(['product', id], async () => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  });

  const { data: reviews } = useQuery(['reviews', id], async () => {
    const response = await api.get(`/reviews/product/${id}`);
    return response.data.data;
  });

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Added to cart');
  };

  if (isLoading) return <Loader />;
  if (!product) return <div>Product not found</div>;

  const currentPrice = quantity >= product.pricing.minWholesaleQuantity
    ? product.pricing.wholesalePrice
    : product.pricing.retailPrice;

  const imageUrl = product.images?.[selectedImage]?.url 
    ? product.images[selectedImage].url
    : 'https://via.placeholder.com/600x600?text=No+Image';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="badge badge-info capitalize">{product.category}</span>
            {product.inventory.inStock ? (
              <span className="badge badge-success">In Stock</span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.ratings.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
            </span>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Pricing */}
          <div className="card p-6 mb-6">
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                Rs. {currentPrice.toLocaleString()}
                <span className="text-base text-gray-600 font-normal"> / {product.unit}</span>
              </div>
              {quantity < product.pricing.minWholesaleQuantity && (
                <p className="text-sm text-gray-600">
                  Buy {product.pricing.minWholesaleQuantity}+ units at Rs. {product.pricing.wholesalePrice} each
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-secondary p-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field w-20 text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn-secondary p-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="text-gray-600">
                  Available: {product.inventory.stock}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inventory.inStock}
              className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-3"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Quality Product</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Truck className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Fast Delivery</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Secure Payment</div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <div className="text-sm text-gray-600 capitalize">{key}</div>
                      <div className="font-medium">{value}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {reviews?.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{review.user.name}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;