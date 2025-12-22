import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Pakistan',
    phone: user?.phone || '',
    paymentMethod: 'cod',
    couponCode: ''
  });

  const subtotal = getTotal();
  const tax = subtotal * 0.05;
  const shipping = subtotal > 10000 ? 0 : 500;
  const total = subtotal + tax + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        couponCode: formData.couponCode || undefined
      };

      const response = await api.post('/orders', orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Truck className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold">Shipping Address</h2>
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
                    required
                    className="input-field"
                    placeholder="House no, Street name"
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
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
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
                    required
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
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCard className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive the order</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Pay securely with your card</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <div className="font-semibold">UPI Payment</div>
                    <div className="text-sm text-gray-600">Pay using UPI</div>
                  </div>
                </label>

                {user?.creditLimit > 0 && (
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-600 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === 'credit'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div>
                      <div className="font-semibold">Credit Payment</div>
                      <div className="text-sm text-gray-600">
                        Available Credit: Rs. {(user.creditLimit - user.usedCredit).toLocaleString()}
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Coupon Code */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Have a Coupon?</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  placeholder="Enter coupon code"
                  className="input-field flex-grow"
                />
                <button type="button" className="btn-outline">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => {
                  const price = item.quantity >= item.product.pricing.minWholesaleQuantity
                    ? item.product.pricing.wholesalePrice
                    : item.product.pricing.retailPrice;

                  return (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <div className="flex-grow">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold">Rs. {(price * item.quantity).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-6"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-600 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;