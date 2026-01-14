import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Tag, TrendingUp, Package } from 'lucide-react';
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
    ? product.images[0].url
    : 'https://via.placeholder.com/300x300?text=No+Image';

  // Calculate discount percentage if applicable
  const discountPercent = product.pricing.wholesalePrice 
    ? Math.round(((product.pricing.retailPrice - product.pricing.wholesalePrice) / product.pricing.retailPrice) * 100)
    : 0;

  return (
    <Link 
      to={`/products/${product._id}`} 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
    >
      {/* Image Container with Overlay Effects */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="bg-white/95 backdrop-blur-sm text-primary-600 px-3 py-1 rounded-full text-xs font-bold capitalize shadow-lg">
            {product.category}
          </span>
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Stock Status Overlay */}
        {!product.inventory.inStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-xl">
              Out of Stock
            </div>
          </div>
        )}

        {/* Rating Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition duration-300">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-900">{product.ratings.average.toFixed(1)}</span>
          <span className="text-xs text-gray-600">({product.ratings.count})</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary-600 transition min-h-[3.5rem]">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Pricing Section */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xs text-gray-600 font-medium mb-1">Retail Price</div>
              <div className="text-2xl font-black text-primary-600">
                Rs. {product.pricing.retailPrice.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 font-medium mb-1">Wholesale</div>
              <div className="text-lg font-bold text-green-600">
                Rs. {product.pricing.wholesalePrice.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Min Quantity Badge */}
          <div className="flex items-center gap-2 pt-2 border-t border-primary-200">
            <Package className="h-4 w-4 text-primary-600" />
            <span className="text-xs text-gray-700">
              Min. {product.pricing.minWholesaleQuantity} units for wholesale price
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inventory.inStock}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md group"
        >
          <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition" />
          <span>{product.inventory.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;