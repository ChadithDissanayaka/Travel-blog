import { Link } from 'react-router-dom';
import { Globe, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-6 w-6 text-teal-400" />
              <span className="font-bold text-xl">Wanderlust</span>
            </div>
            <p className="text-slate-300 mb-4">
              Share your travel experiences and discover new destinations with fellow explorers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-300 hover:text-teal-400 transition-colors">Home</Link></li>
              <li><Link to="/login" className="text-slate-300 hover:text-teal-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-slate-300 hover:text-teal-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Popular Destinations</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Japan</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Italy</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">New Zealand</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Iceland</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-300 hover:text-teal-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400">
          <p>&copy; {currentYear} Wanderlust Travel Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;