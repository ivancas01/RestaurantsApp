import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const AccessDenied = ({ permission }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-surface border-2 border-dashed border-zinc-200 dark:border-zinc-800 uppercase">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-primary/10 border-2 border-primary flex items-center justify-center mb-8 relative"
      >
        <ShieldAlert size={48} className="text-primary" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2"
        >
          <Lock size={20} className="text-primary fill-primary" />
        </motion.div>
      </motion.div>

      <h2 className="text-4xl md:text-5xl font-serif text-text-bright mb-4">Acceso <span className="text-primary italic">Restringido</span></h2>
      <p className="text-[10px] md:text-xs text-text-dim tracking-[0.3em] font-bold mb-10 max-w-md leading-relaxed">
        Tu credencial actual no posee el nivel de autorización necesario para operar este módulo: 
        <span className="block text-primary mt-2">[{permission || 'GENERAL_ACCESS'}]</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/hidden-admin')}
          className="flex items-center space-x-2 py-4 px-8 border-zinc-700"
        >
          <ArrowLeft size={16} />
          <span>Volver al Panel</span>
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          className="py-4 px-8"
          style={{ boxShadow: '8px 8px 0px 0px var(--primary-shadow-20)' }}
        >
          Re-Verificar Permisos
        </Button>
      </div>
      
      <div className="mt-12 opacity-20 text-[8px] font-black tracking-widest">
        Urban Street Security Protocol // Error 403
      </div>
    </div>
  );
};

export default AccessDenied;
