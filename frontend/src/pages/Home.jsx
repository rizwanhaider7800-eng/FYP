import { Link } from 'react-router-dom';
import { Package, TrendingUp, Shield, Truck } from 'lucide-react';
import { useQuery } from 'react-query';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';
import cementImage from '../assets/Cement.jpg'
import steelImage from '../assets/Steel.jpg'
import bricksImage from '../assets/bricks.jpg'
import tilesImage from '../assets/tiles.png'

function Home() {
  const { data: products, isLoading } = useQuery('featured-products', async () => {
    const response = await api.get('/products?featured=true&limit=8');
    return response.data.data;
  });

  const categories = [
    { name: 'Cement', image: cementImage, link: '/products?category=cement' },
    { name: 'Steel', image: steelImage, link: '/products?category=steel' },
    { name: 'Bricks', image: bricksImage, link: '/products?category=bricks' },
    { name: 'Tiles', image: tilesImage, link: '/products?category=tiles' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'Competitive wholesale and retail pricing'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Top quality construction materials'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service'
    },
    {
      icon: Package,
      title: 'Bulk Orders',
      description: 'Special discounts on bulk purchases'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Quality Construction Materials
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Wholesale & Retail • Best Prices • Fast Delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="card overflow-hidden hover:shadow-lg transition group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-center">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>
          
          {isLoading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Get the best construction materials at unbeatable prices
          </p>
          <Link to="/products" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;