import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../Common/SearchBar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-10 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-teal-600" />
            <span className="font-bold text-xl text-teal-700">Wanderlust</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <SearchBar className="w-96" />
            <Link to="/" className="nav-link">Home</Link>
            
            {user ? (
              <>
                <Link to="/blog" className="nav-link">Blog</Link>
                <Link to={`/profile/${user.username}`} className="nav-link flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-700 hover:text-teal-600 transition-colors">Login</Link>
                <Link 
                  to="/register" 
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-500 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <SearchBar className="mb-4" />
            <div className="flex flex-col space-y-3">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Home</Link>
              
              {user ? (
                <>
                  <Link to="/blog" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Blog</Link>
                  <Link 
                    to={`/profile/${user.username}`} 
                    className="mobile-nav-link" 
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-500 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link 
                    to="/register" 
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-center" 
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
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