import { Link } from 'react-router-dom';
import { Globe, Instagram, Twitter, Facebook, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Wanderlust</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              A community of passionate travelers sharing stories, tips, and inspiration from every corner of the world.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Explore Stories' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Join Wanderlust' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Destinations</h4>
            <ul className="space-y-2.5">
              {['Japan', 'Italy', 'New Zealand', 'Iceland', 'Sri Lanka'].map((dest) => (
                <li key={dest}>
                  <a href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                    {dest}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Wanderlust Travel Blog. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for explorers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
