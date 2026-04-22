import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const Toaster = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-8 right-8 z-[1500] flex flex-col space-y-4 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto flex items-center p-4 min-w-[300px] border-l-4 shadow-2xl backdrop-blur-md transition-all
              ${n.type === 'success' ? 'bg-primary/90 border-text-bright text-white' : 
                n.type === 'error' ? 'bg-accent/90 border-white text-white' : 
                'bg-zinc-800/90 border-primary text-text-bright'}
            `}
          >
            <div className="flex items-center space-x-4 flex-1">
              {n.type === 'success' && <CheckCircle size={20} />}
              {n.type === 'error' && <AlertCircle size={20} />}
              {n.type === 'warning' && <Info size={20} />}
              
              <div className="flex flex-col">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                   {n.type === 'success' ? 'Operación Exitosa' : n.type === 'error' ? 'Error Detectado' : 'Aviso Sistema'}
                 </p>
                 <p className="text-xs font-bold uppercase tracking-widest">{n.message}</p>
              </div>
            </div>

            <button 
              onClick={() => removeNotification(n.id)}
              className="ml-4 p-1 hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
