import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const RESTAURANT_PHOTOS = [
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop"
];

const AboutSection = () => {
  const { cmsData = {} } = useAdmin() || {};
  const about = cmsData?.about || {
    title: "Nuestra // Historia",
    desc_1: "Nacimos en el asfalto, inspirados por el ruido y la energía inagotable de la ciudad. No creemos en mesas con manteles blancos ni en etiquetas aburridas.",
    desc_2: "Aquí, la alta cocina se ensucia las manos. Tomamos ingredientes locales de la más alta calidad y los pasamos por el fuego puro de nuestras parrillas urbanas.",
    years_label: "Years on the street",
    years_value: "10",
    feature_1_title: "RAW MATERIALS",
    feature_1_desc: "Solo ingredientes frescos y directos de origen local.",
    feature_2_title: "URBAN SOUL",
    feature_2_desc: "Ambiente diseñado para la ciudad que nunca duerme.",
    images: RESTAURANT_PHOTOS,
    content: "Lumina Urban Gourmet nació en las calles vibrantes de la ciudad, donde el arte y la gastronomía convergen. No solo servimos comida, creamos experiencias sensoriales que desafían lo convencional."
  };
  const safeTitle = about.title || "Nuestra // Historia";
  const [titleMain, titleItalic] = safeTitle.includes('//') ? safeTitle.split('//').map(s => s.trim()) : [safeTitle, ''];
  
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % RESTAURANT_PHOTOS.length);
  };

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + RESTAURANT_PHOTOS.length) % RESTAURANT_PHOTOS.length);
  };

  return (
    <section id="nosotros" className="py-20 md:py-32 bg-surface text-text-bright relative overflow-hidden group/section">
      {/* Background Graphic Element */}
      <div className="absolute -left-10 md:-left-20 top-0 text-[8rem] md:text-[15rem] font-serif opacity-[0.02] select-none uppercase pointer-events-none">
        {cmsData?.brand?.name?.split(' ')[0] || 'URBAN'}
      </div>
      
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative order-2 md:order-1 px-4 md:px-0"
        >
          {/* Carousel Container */}
          <div className="relative group">
            {/* Background Decorative Square */}
            <div className="aspect-square bg-primary/10 absolute -inset-2 md:-inset-4 border-2 border-primary/20 translate-x-4 translate-y-4 md:translate-x-8 md:translate-y-8"></div>
            
             <div className="relative aspect-square overflow-hidden border-2 border-white/5 shadow-2xl bg-zinc-900">
               <AnimatePresence mode="wait">
                 {about.images && about.images.length > 0 ? (
                   <motion.img 
                     key={currentPhoto}
                     src={about.images[currentPhoto]} 
                     alt={`Urban Restaurant View ${currentPhoto + 1}`} 
                     initial={{ opacity: 0, scale: 1.1 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.5 }}
                     className="w-full h-full object-cover grayscale group-hover/section:grayscale-0 transition-all duration-700"
                   />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 p-12 text-center bg-zinc-900">
                     <ImageIcon size={64} strokeWidth={1} className="mb-4" />
                     <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Carga fotos de tu local en el panel de control</p>
                   </div>
                 )}
               </AnimatePresence>
 
               {/* Navigation Controls */}
               {about.images && about.images.length > 1 && (
                 <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                   <button 
                     onClick={prevPhoto}
                     className="w-12 h-12 bg-primary/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
                   >
                     <ChevronLeft size={24} />
                   </button>
                   <button 
                     onClick={nextPhoto}
                     className="w-12 h-12 bg-primary/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
                   >
                     <ChevronRight size={24} />
                   </button>
                 </div>
               )}
 
               {/* Photo Counter */}
               {about.images && about.images.length > 0 && (
                 <div className="absolute top-4 left-4 bg-background/50 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white/5 z-20">
                   SCENE 0{currentPhoto + 1} / 0{about.images.length}
                 </div>
               )}
               
               {/* Progress Dots */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                 {about.images && about.images.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 transition-all duration-300 ${i === currentPhoto ? 'bg-primary w-6' : 'bg-white/30'}`}
                    />
                 ))}
               </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-primary p-8 md:p-12 shadow-xl z-30 pointer-events-none">
              <span className="text-4xl md:text-6xl font-serif text-text-bright block leading-none">{about.years_value}</span>
              <span className="text-[8px] md:text-xs uppercase tracking-widest font-bold">{about.years_label}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="order-1 md:order-2"
        >
          <h2 className="mb-8">
            {titleMain} <br /> <span className="text-primary italic">{titleItalic}</span>
          </h2>
          <div className="space-y-6 text-text-dim text-base md:text-lg leading-relaxed uppercase tracking-wide">
            <p className="border-l-4 border-primary pl-6">
              {about.content}
            </p>
          </div>
          
          <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 border-t border-white/10 pt-10 md:pt-12">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-primary mb-2 font-bold">// {about.feature_1_title}</p>
              <p className="text-xs md:text-sm text-text-dim">{about.feature_1_desc}</p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-primary mb-2 font-bold">// {about.feature_2_title}</p>
              <p className="text-xs md:text-sm text-text-dim">{about.feature_2_desc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
