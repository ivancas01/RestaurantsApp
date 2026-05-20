import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

const Navbar = () => {
  const location = useLocation();
  const { cartItems, cartCount, toggleCart } = useCart();
  const { cmsData } = useAdmin();
  const brand = cmsData?.brand || { name: 'URBAN STREET' };
  const brandParts = brand.name.split(' ');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/#inicio' },
    { name: 'Carta', href: '/#carta' },
    { name: 'Nosotros', href: '/#nosotros' },
    { name: 'Reserva', href: '/#reserva' },
    { name: 'Contáctanos', href: '/#contacto' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled ? 'bg-background/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-8'
      }`}
    >
      <div className="container flex justify-between items-center h-full">
        <Link to="/" className="text-xl md:text-2xl font-serif text-primary tracking-[0.2em] font-bold whitespace-nowrap">
          {brandParts[0]} <span className="text-text-bright">{brandParts.slice(1).join(' ')}</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex space-x-8 xl:space-x-12 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-text-bright hover:text-primary transition-all duration-200 font-bold"
            >
              {link.name}
            </a>
          ))}
          <div className="flex items-center space-x-6 border-l border-white/10 pl-6 ml-2">
            <ThemeToggle />
            <button 
              onClick={toggleCart}
              className="text-text-bright hover:text-primary transition-colors relative group"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-none shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="xl:hidden flex items-center space-x-5">
          <button 
            onClick={toggleCart}
            className="text-text-bright hover:text-primary transition-colors relative"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-none">
                {cartCount}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-text-bright p-2 -mr-2 transition-transform active:scale-90"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-surface border-b-2 border-primary xl:hidden shadow-2xl"
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link, index) => (
                <motion.a
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-serif uppercase tracking-widest text-text-bright hover:text-primary transition-colors flex items-center space-x-4 group"
                >
                  <span className="text-[10px] text-primary font-bold opacity-40 group-hover:opacity-100">0{index + 1}</span>
                  <span>{link.name}</span>
                </motion.a>
              ))}
              
              <div className="pt-6 border-t border-white/5 flex flex-col space-y-4">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">Urban Street // Operational Status: Online</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
