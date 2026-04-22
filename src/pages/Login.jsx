import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      navigate('/hidden-admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Urban Vibe */}
      <div className="absolute inset-0 z-0 grayscale opacity-10 dark:opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1555392816-4aa3b306e041?q=80&w=1920&auto=format&fit=crop" 
          alt="Urban Kitchen" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 dark:bg-background/90"></div>
      </div>

      {/* Decorative Text */}
      <div className="absolute top-10 left-10 text-[8rem] font-serif opacity-[0.03] select-none uppercase hidden lg:block -rotate-90 origin-top-left">
        AUTHENTICATE
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-text-dim hover:text-primary transition-colors mb-8 uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft size={16} />
          <span>Volver al Sitio</span>
        </button>

        <div className="glass-card !p-12 relative transition-all duration-200 border-zinc-200 dark:border-zinc-800 shadow-xl">
          {/* Top Bar Decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 border-2 border-primary mx-auto mb-6 flex items-center justify-center text-primary bg-primary/5">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-serif uppercase tracking-wider mb-2 text-text-bright">Acceso <br /><span className="text-primary">Personal</span></h1>
            <p className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold">Lumina Urban Gourmet // Staff Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Identificación / Email" 
              icon={User}
              placeholder="ID-0000" 
              required
            />
            
            <Input 
              label="Contraseña" 
              icon={Lock}
              type="password" 
              placeholder="••••••••" 
              required
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full text-lg py-4"
                disabled={loading}
              >
                {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-[10px] text-text-dim uppercase tracking-widest">
            ¿Problemas de acceso? <br /> Contacta con soporte técnico.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
