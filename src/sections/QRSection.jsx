import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const QRSection = () => {
  const { cmsData } = useAdmin();
  const brandName = cmsData?.brand?.name || "Lumina Urban Gourmet";
  
  // Dynamically generate the menu URL pointing to the /menu route of the current site
  const menuUrl = typeof window !== 'undefined' ? `${window.location.origin}/menu` : '';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;

  return (
    <section className="py-24 bg-background relative overflow-hidden flex items-center justify-center">
      {/* Decorative large text background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <span className="text-[20rem] font-serif uppercase leading-none">DIGITAL</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div 
          className="max-w-6xl mx-auto bg-surface border-4 border-primary p-1 md:p-2"
          style={{ boxShadow: '20px 20px 0px 0px var(--primary-shadow-10)' }}
        >
          <div className="border border-primary/20 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Left: Content */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-primary font-bold uppercase tracking-[0.4em] text-xs mb-4"
                >
                  // Escanea y pide rápido
                </motion.p>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-serif uppercase text-text-bright leading-[0.9]"
                >
                  Lleva la <br /> <span className="text-primary italic">Carta</span> en tu <br /> Bolsillo
                </motion.h2>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <p className="text-text-dim uppercase tracking-widest text-sm leading-loose max-w-md mx-auto lg:mx-0">
                  Escanea el código para explorar nuestra carta completa directamente desde tu dispositivo. 
                  Sin esperas, con toda la energía urbana.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <div className="flex items-center space-x-3 text-text-bright">
                    <div className="w-10 h-10 border border-primary/30 flex items-center justify-center rounded-full">
                      <Smartphone size={18} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Paso 1: Abre tu cámara</span>
                  </div>
                  <div className="flex items-center space-x-3 text-text-bright">
                    <div className="w-10 h-10 border border-primary/30 flex items-center justify-center rounded-full">
                      <ArrowRight size={18} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Paso 2: ¡Elige tu plato!</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: QR Poster Area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white p-4 shadow-2xl relative group">
                {/* Physical Tag UI */}
                <div className="absolute -top-4 -left-4 bg-primary text-white text-[10px] font-bold py-2 px-4 uppercase tracking-tighter -rotate-12">
                  Menú Oficial
                </div>
                
                <div className="border-[12px] border-zinc-900 p-2 bg-white">
                  <img 
                    src={qrImageUrl} 
                    alt="Menu QR Code" 
                    className="w-64 h-64 md:w-80 md:h-80 object-contain bg-white"
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.2em]">{brandName} // Escáneame</p>
                </div>

                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 animate-scan pointer-events-none"></div>
              </div>

              {/* Background accents */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary/20 -z-10 translate-x-4 translate-y-4"></div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default QRSection;
