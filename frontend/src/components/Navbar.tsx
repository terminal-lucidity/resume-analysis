import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleLinkClick = (href: string) => {
    closeMenu();
    // Handle navigation here (e.g., with React Router)
    console.log('Navigate to:', href);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${className}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-text">Vettly</span>
        </div>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <button 
              className="navbar-link"
              onClick={() => handleLinkClick('/features')}
            >
              Features
            </button>
          </li>
          <li className="navbar-item">
            <button 
              className="navbar-link"
              onClick={() => handleLinkClick('/pricing')}
            >
              Pricing
            </button>
          </li>
          <li className="navbar-item">
            <button 
              className="navbar-link"
              onClick={() => handleLinkClick('/about')}
            >
              About
            </button>
          </li>
          <li className="navbar-item">
            <button 
              className="navbar-link"
              onClick={() => handleLinkClick('/contact')}
            >
              Contact
            </button>
          </li>
          <li className="navbar-item">
            <button 
              className="navbar-link theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </li>
          <li className="navbar-item navbar-cta">
            <button 
              className="navbar-link cta-button"
              onClick={() => handleLinkClick('/sign-in')}
            >
              Sign In
            </button>
          </li>
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
    </nav>
  );
};

export default Navbar;