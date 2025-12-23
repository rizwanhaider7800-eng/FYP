import { Link } from 'react-router-dom';
import { Package, TrendingUp, Shield, Truck, Star, Users, CheckCircle, ArrowRight, Zap, Award } from 'lucide-react';
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
    { name: 'Cement', image: cementImage, link: '/products?category=cement', count: '150+ Products' },
    { name: 'Steel', image: steelImage, link: '/products?category=steel', count: '200+ Products' },
    { name: 'Bricks', image: bricksImage, link: '/products?category=bricks', count: '80+ Products' },
    { name: 'Tiles', image: tilesImage, link: '/products?category=tiles', count: '300+ Products' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'Competitive wholesale and retail pricing with special discounts',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Premium quality construction materials from trusted suppliers',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Express delivery to your doorstep within 24-48 hours',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Package,
      title: 'Bulk Orders',
      description: 'Special wholesale rates and customized packages',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Products Available', value: '5,000+', icon: Package },
    { label: 'Years Experience', value: '15+', icon: Award },
    { label: 'Cities Covered', value: '50+', icon: Truck }
  ];

  const testimonials = [
    {
      name: 'Ahmed Khan',
      role: 'Construction Manager',
      rating: 5,
      text: 'Excellent quality materials and timely delivery. Best prices in the market!'
    },
    {
      name: 'Fatima Ali',
      role: 'Architect',
      rating: 5,
      text: 'Professional service and premium quality products. Highly recommended!'
    },
    {
      name: 'Usman Sheikh',
      role: 'Builder',
      rating: 5,
      text: 'Great bulk order discounts and reliable delivery. My go-to supplier!'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Modern Design */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Zap className="h-4 w-4 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">Trusted by 10,000+ Customers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-slide-up">
              Build Your Dreams with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 mt-2">
                Premium Quality Materials
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
              Your one-stop solution for all construction needs. Wholesale & Retail prices with guaranteed quality and express delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-400">
              <Link 
                to="/products" 
                className="group bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                Explore Products
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link 
                to="/register" 
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Start Shopping
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-slide-up animation-delay-600">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-primary-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Card Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We provide the best construction materials with exceptional service and unbeatable value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition duration-300`}></div>
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-xl mb-6 shadow-lg group-hover:scale-110 transition duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Enhanced Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-gray-600 text-lg">Explore our wide range of construction materials</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative card overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  
                  {/* Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-600">
                    {category.count}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 bg-gradient-to-b from-white to-gray-50 group-hover:from-primary-50 group-hover:to-primary-100 transition duration-300">
                  <h3 className="text-lg font-bold text-center group-hover:text-primary-600 transition flex items-center justify-center gap-2">
                    {category.name}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-gray-600 text-lg">Handpicked best sellers and trending items</p>
            </div>
            <Link 
              to="/products" 
              className="group mt-4 md:mt-0 text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 text-lg"
            >
              View All Products
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
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

      {/* Testimonials Section - New */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 text-lg">Trusted by thousands of satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Start Your Construction Project?
              </h2>
              <p className="text-lg md:text-xl mb-8 text-primary-100">
                Get access to premium quality materials at wholesale prices with fast delivery across Pakistan. Join thousands of satisfied customers today!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/products" 
                  className="group bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-xl inline-flex items-center justify-center gap-2"
                >
                  Start Shopping Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link 
                  to="/register" 
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition inline-flex items-center justify-center"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Right Content - Benefits */}
            <div className="space-y-4">
              {[
                'Free delivery on orders above Rs 10,000',
                'Wholesale prices for bulk orders',
                '24/7 customer support available',
                'Quality guarantee on all products'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;