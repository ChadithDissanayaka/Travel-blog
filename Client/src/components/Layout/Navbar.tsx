import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, LogOut, PenLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../Common/SearchBar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'nav-scrolled py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">
              Wanderlust
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <SearchBar className="w-72" />
            <Link to="/" className="nav-link">Explore</Link>

            {user ? (
              <>
                <Link to="/blog" className="nav-link">My Blog</Link>
                <Link
                  to="/create-post"
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <PenLine className="h-4 w-4" />
                  Write
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-teal-400 transition-all">
                    <img
                      src={user.profilePicture || user.profile_picture || `https://ui-avatars.com/api/?name=${user.username}&background=0d9488&color=fff`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-teal-600 transition-colors">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign in</Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4">
            <SearchBar className="mb-4" />
            <div className="flex flex-col gap-1">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Explore</Link>
              {user ? (
                <>
                  <Link to="/blog" className="mobile-nav-link" onClick={() => setIsOpen(false)}>My Blog</Link>
                  <Link to="/create-post" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Write a Post</Link>
                  <Link to={`/profile/${user.username}`} className="mobile-nav-link flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left py-2.5 text-red-500 font-medium text-sm">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Sign in</Link>
                  <Link to="/register" className="mt-2 bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center" onClick={() => setIsOpen(false)}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
