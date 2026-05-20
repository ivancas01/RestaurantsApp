import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-4xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[2000] flex items-center justify-center p-4 lg:p-10 pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-md pointer-events-auto"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`bg-surface border-4 border-primary w-full ${maxWidth} flex flex-col max-h-[90vh] pointer-events-auto relative`}
            style={{ boxShadow: '0 0 50px var(--primary-shadow-30)' }}
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex justify-between items-center flex-shrink-0">
               <div>
                  <h2 className="text-2xl lg:text-3xl font-serif uppercase leading-none">
                    {title} {subtitle && <span className="italic text-white/80">{subtitle}</span>}
                  </h2>
               </div>
               <button onClick={onClose} className="hover:rotate-90 transition-all">
                  <X size={32}/>
               </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
               {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
