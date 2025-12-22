import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

function Cart() {
  const { items, removeFromCart, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.quantity >= item.product.pricing.minWholesaleQuantity
              ? item.product.pricing.wholesalePrice
              : item.product.pricing.retailPrice;

            return (
              <div key={item.product._id} className="card p-4">
                <div className="flex gap-4">
                  <img
                    src={`http://localhost:5000${item.product.images[0]?.url}`}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">{item.product.category}</p>
                    <div className="mt-2">
                      <span className="text-primary-600 font-bold">Rs. {price}</span>
                      <span className="text-gray-500 text-sm"> / {item.product.unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="btn-secondary px-2 py-1"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="btn-secondary px-2 py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs. {getTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-semibold">Rs. {(getTotal() * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Rs. {getTotal() > 10000 ? 0 : 500}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  Rs. {(getTotal() * 1.05 + (getTotal() > 10000 ? 0 : 500)).toLocaleString()}
                </span>
              </div>
            </div>
            <Link to="/checkout" className="w-full btn-primary block text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;