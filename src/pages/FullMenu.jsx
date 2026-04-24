import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QRSection from '../sections/QRSection';

const FullMenu = () => {
  const { addToCart } = useCart();
  const { menu = [] } = useAdmin();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-20">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 border-l-4 md:border-l-8 border-primary pl-6 md:pl-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="leading-none text-text-bright">
                La <span className="text-primary italic">Carta</span>
              </h1>
              <p className="text-text-dim tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs uppercase mt-4 font-bold">Urban Street // Operational Menu</p>
            </motion.div>
            
            <Link to="/" className="flex items-center space-x-2 text-text-dim hover:text-primary transition-colors mt-6 md:mb-2 uppercase tracking-widest text-[10px] md:text-xs font-bold group">
              <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
              <span>Regresar al Inicio</span>
            </Link>
          </div>

          {/* Categories */}
          <div className="space-y-20 md:space-y-32">
            {menu.map((category, catIndex) => (
              <div key={category.id} id={category.id}>
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.3 }}
                   className="flex items-center space-x-6 mb-8 md:mb-12"
                >
                  <h2 className="text-3xl md:text-6xl font-serif uppercase text-text-bright">{category.name}</h2>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10"></div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                  {(category.products || []).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-surface p-6 md:p-8 group relative overflow-hidden flex flex-col h-full"
                    >
                      <div className="aspect-video overflow-hidden mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 border border-zinc-100 dark:border-zinc-800">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg md:text-xl font-serif text-text-bright uppercase tracking-wide pr-4 leading-tight">{item.name}</h3>
                        <span className="text-primary font-bold text-base md:text-lg whitespace-nowrap">{item.price}</span>
                      </div>
                      
                      <div className="w-8 h-1 bg-primary mb-4 group-hover:w-full transition-all duration-300"></div>
                      
                      <p className="text-text-dim text-[10px] md:text-xs uppercase tracking-wider mb-8 flex-grow leading-relaxed">
                        {item.description}
                      </p>
                      
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-full border-2 border-primary/20 py-3 uppercase tracking-widest text-[9px] md:text-[10px] font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center space-x-2"
                      >
                        <ShoppingBag size={14} />
                        <span>Agregar al pedido</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <QRSection />
      <Footer />
    </div>
  );
};

export default FullMenu;
