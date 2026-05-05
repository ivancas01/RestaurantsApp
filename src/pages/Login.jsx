import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { api } from '../services/api';
import { useAdmin } from '../context/AdminContext';

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, refreshData } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('urban_token')) {
      navigate('/hidden-admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const data = await api.login(username, password);
      localStorage.setItem('urban_token', data.access);
      localStorage.setItem('urban_refresh_token', data.refresh);
      
      // Fetch profile and update context
      const profile = await api.getMe();
      setCurrentUser(profile);
      await refreshData();
      
      navigate('/hidden-admin');
    } catch (err) {
      setError('Credenciales inválidas o error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              label="Usuario" 
              icon={User}
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <Input 
              label="Contraseña" 
              icon={Lock}
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center">{error}</p>}

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
