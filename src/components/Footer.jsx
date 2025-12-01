import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 font-sans pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <span className="text-xl">🔬</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none tracking-tight">ProLab</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Equipment</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering scientific discovery with precision laboratory equipment. Trusted by top research institutions worldwide.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter className="w-4 h-4" />} />
              <SocialIcon icon={<Linkedin className="w-4 h-4" />} />
              <SocialIcon icon={<Facebook className="w-4 h-4" />} />
              <SocialIcon icon={<Instagram className="w-4 h-4" />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Cart</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
              <li><Link to="/warranty" className="hover:text-indigo-400 transition-colors">Warranty Policy</Link></li>
              <li><Link to="/service" className="hover:text-indigo-400 transition-colors">Service & Repair</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest product updates and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-indigo-500"
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Subscribe <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} ProLab Equipment. All rights reserved.</p>
          <div className="flex gap-6">
            <span>ISO 9001:2015 Certified</span>
            <span>ISO 13485 Compliant</span>
            <a href="/admin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Admin Portal</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }) => (
  <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
    {icon}
  </button>
);

export default Footer;