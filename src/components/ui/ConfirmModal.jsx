import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Eliminar', type = 'danger', children }) => {
  const isDanger = type === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[2000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-surface border-4 border-zinc-200 dark:border-zinc-800 w-full max-w-sm shadow-2xl relative p-8 flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDanger ? 'bg-accent/10 text-accent border-2 border-accent/20' : 'bg-primary/10 text-primary border-2 border-primary/20'}`}>
               <AlertTriangle size={32} />
            </div>

            <h3 className="text-2xl font-serif uppercase tracking-tight text-text-bright mb-2">{title}</h3>
            <p className="text-xs uppercase tracking-widest text-text-dim leading-relaxed mb-4">{message}</p>

            {children && <div className="w-full mb-8">{children}</div>}

            <div className="flex space-x-3 w-full">
               <Button variant="outline" onClick={onClose} className="flex-1 text-[10px] uppercase font-bold border-zinc-700">
                  Cancelar
               </Button>
               <Button 
                 onClick={() => {
                    onConfirm();
                    onClose();
                 }} 
                 className={`flex-1 text-[10px] uppercase font-bold ${isDanger ? 'bg-accent border-accent text-zinc-900 dark:text-zinc-900 hover:bg-accent/90' : ''}`}
               >
                  {confirmLabel}
               </Button>
            </div>
            
            <button onClick={onClose} className="absolute top-4 right-4 text-text-dim hover:text-primary transition-colors">
               <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
