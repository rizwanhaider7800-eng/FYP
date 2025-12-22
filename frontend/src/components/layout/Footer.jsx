import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">Construction Material</span>
            </div>
            <p className="text-sm">
              Your trusted partner for construction materials. Quality products at wholesale and retail prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-primary-500 transition">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary-500 transition">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-500 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-500 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=cement" className="hover:text-primary-500 transition">
                  Cement
                </Link>
              </li>
              <li>
                <Link to="/products?category=steel" className="hover:text-primary-500 transition">
                  Steel
                </Link>
              </li>
              <li>
                <Link to="/products?category=bricks" className="hover:text-primary-500 transition">
                  Bricks
                </Link>
              </li>
              <li>
                <Link to="/products?category=tiles" className="hover:text-primary-500 transition">
                  Tiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+92 316 4221602</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@construction.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Kasur, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 ConstructionMaterial. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;