import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

function ProductCard({ product }) {
  const { addToCart } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Added to cart');
  };

  const imageUrl = product.images?.[0]?.url 
    ? `http://localhost:5000${product.images[0].url}` 
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link to={`/products/${product._id}`} className="card overflow-hidden hover:shadow-lg transition group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {!product.inventory.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="badge badge-danger text-base px-4 py-2">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-info capitalize">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.ratings.average.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.ratings.count})</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              Rs. {product.pricing.retailPrice}
            </div>
            <div className="text-xs text-gray-500">
              Wholesale: Rs. {product.pricing.wholesalePrice}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Min Qty</div>
            <div className="text-sm font-medium">{product.pricing.minWholesaleQuantity}</div>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inventory.inStock}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;