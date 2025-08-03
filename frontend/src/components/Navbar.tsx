import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  className?: string;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Check authentication status
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage changes (when other components update localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };

    // Listen for custom auth state change events
    const handleAuthStateChange = (e: CustomEvent) => {
      if (e.detail.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(e.detail.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: false, user: null }
    }));
    
    navigate('/');
  };

  const handleLinkClick = (href: string) => {
    closeMenu();
    closeProfileDropdown();
    navigate(href);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${className}`}>
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => handleLinkClick('/')}>
          <span className="brand-text">Vettly</span>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated && (
            <li className="navbar-item">
              <button 
                className="navbar-link"
                onClick={() => handleLinkClick('/dashboard')}
              >
                Dashboard
              </button>
            </li>
          )}
          {isAuthenticated && (
            <li className="navbar-item">
              <button 
                className="navbar-link"
                onClick={() => handleLinkClick('/tracker')}
              >
                Company Tracker
              </button>
            </li>
          )}

          <li className="navbar-item">
            <button 
              className="navbar-link theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </li>
          {isAuthenticated ? (
            <li className="navbar-item navbar-cta">
              <div className="navbar-profile-dropdown">
                <button 
                  className="navbar-profile-button"
                  onClick={toggleProfileDropdown}
                  aria-label="Profile menu"
                >
                  <div className="profile-avatar">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="profile-name">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="profile-dropdown-info">
                        <p className="profile-dropdown-name">
                          {user?.name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="profile-dropdown-email">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider"></div>
                    <button 
                      className="profile-dropdown-item"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </li>
          ) : (
            <li className="navbar-item navbar-cta">
              <button 
                className="navbar-link cta-button"
                onClick={() => handleLinkClick('/signin')}
              >
                Sign In
              </button>
            </li>
          )}
        </ul>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={closeMenu}></div>
      )}
      
      {/* Profile dropdown overlay */}
      {isProfileDropdownOpen && (
        <div className="profile-dropdown-overlay" onClick={closeProfileDropdown}></div>
      )}
    </nav>
  );
};

export default Navbar;