import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

const MenuSection = () => {
  const { addToCart } = useCart();
  const { menu = [] } = useAdmin();
  
  // Extract first 3 products for the home page preview
  const dishes = menu.flatMap(c => c.products || []).slice(0, 3);

  return (
    <section id="carta" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute left-0 top-0 w-full h-px bg-primary/20"></div>
      
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 leading-none">
              Street <span className="text-primary italic">Menu</span>
            </h2>
            <p className="text-text-dim tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm uppercase font-bold">Curated // Urban // Bold</p>
          </motion.div>
          <div className="hidden md:block w-1/3 h-px bg-zinc-200 dark:bg-white/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface p-8 md:p-12 group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-4 font-serif text-4xl md:text-5xl text-zinc-100 dark:text-white/5 group-hover:text-primary transition-colors duration-200">
                0{index + 1}
              </div>
              
              <div className="overflow-hidden mb-8 md:mb-10 aspect-[4/3] grayscale transition-all duration-500 group-hover:grayscale-0 border border-zinc-100 dark:border-zinc-800">
                <img 
                  src={dish.image} 
                  alt={dish.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl md:text-2xl font-serif text-text-bright uppercase tracking-wide">{dish.name}</h3>
                  <span className="text-primary font-bold text-lg md:text-xl">{dish.price}</span>
                </div>
                <div className="w-10 md:w-12 h-1 bg-primary group-hover:w-full transition-all duration-300"></div>
                <p className="text-text-dim text-[11px] md:text-xs leading-relaxed uppercase tracking-widest mb-6">{dish.description}</p>
              </div>

              <button 
                onClick={() => addToCart(dish)}
                className="w-full py-4 border-2 border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all mt-auto"
              >
                Agregar para domicilio
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 flex flex-col md:flex-row justify-center gap-4 md:gap-6">
          <Link to="/menu" className="btn-primary">Ver Carta Completa</Link>
          <button className="btn-outline">Descargar Menú PDF</button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
