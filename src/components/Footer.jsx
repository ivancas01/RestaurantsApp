import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Footer = () => {
  const navigate = useNavigate();
  const { cmsData } = useAdmin();
  const brand = cmsData?.brand || { name: 'URBAN STREET' };
  const brandParts = brand.name.split(' ');

  return (
    <footer className="py-20 border-t border-white/5 bg-surface relative overflow-hidden">
      <div className="container flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-2xl font-serif text-primary tracking-[0.2em] font-bold mb-4">
            {brandParts[0]} <span className="text-text-bright">{brandParts.slice(1).join(' ')}</span>
          </div>
          <p className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold max-w-xs leading-relaxed opacity-60">
            Experience the city through flavor. <br />Premium Urban Gastronomy.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end space-y-6">
          <div className="flex space-x-6 mb-2">
             <a href="#" className="text-[10px] uppercase tracking-widest text-text-dim hover:text-primary transition-colors font-bold">Instagram</a>
             <a href="#" className="text-[10px] uppercase tracking-widest text-text-dim hover:text-primary transition-colors font-bold">Facebook</a>
          </div>
          
          <p className="text-text-dim/30 text-[9px] uppercase tracking-[0.2em] font-bold">
            © 2026 {brand.name} // Digital Gastronomy.
          </p>
          
          <button 
            onClick={() => navigate('/login')}
            className="group flex items-center space-x-3 text-[10px] uppercase tracking-[0.4em] font-bold text-text-dim/50 hover:text-primary transition-all px-4 py-2 border border-white/5 hover:border-primary/20 bg-background/50"
          >
            <ShieldAlert size={12} className="text-primary" />
            <span>Operational Portal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
