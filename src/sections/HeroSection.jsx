import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';

// Product Image generated via AI
const PRODUCT_IMAGE = "file:///C:/Users/ivanc/.gemini/antigravity/brain/f538c209-2d5b-4265-9bff-70cef98c35f9/urban_hero_burger_1776653580173.png";

const HeroSection = () => {
  const { cmsData, getMostOrderedProduct } = useAdmin();
  const { hero } = cmsData;

  const topProduct = getMostOrderedProduct();
  const featured = topProduct || {
    name: hero.featured_name,
    price: hero.featured_price,
    description: hero.featured_desc,
    image: hero.featured_image,
    totalOrders: 0
  };

  // Formatting title: "Main Part // Italic Part"
  const [mainTitle, italicTitle] = hero.title.split('//').map(t => t.trim());

  return (
    <section id="inicio" className="relative min-h-screen w-full overflow-hidden flex items-center bg-background pt-32 md:pt-0">
      {/* Background Video - Urban/Street Vibe */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale opacity-30 dark:opacity-50"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-busy-street-of-a-metropolis-at-night-4217-large.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10 dark:opacity-20 z-10"></div>
      </div>

      <div className="container relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        {/* Left Side: Text Content */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="border-l-4 md:border-l-8 border-primary pl-6 md:pl-8 max-w-4xl text-left"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary uppercase tracking-[0.3em] md:tracking-[0.5em] font-bold mb-4 block text-[10px] md:text-sm"
          >
            {hero.established}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            {mainTitle} {italicTitle && <><br /><span className="text-primary italic">{italicTitle}</span></>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text-dim max-w-xl mb-10 text-base md:text-xl border-t border-zinc-200 dark:border-white/10 pt-6 uppercase tracking-wider leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6"
          >
            <Button variant="primary" className="text-base md:text-xl w-full sm:w-auto">{hero.cta_menu}</Button>
            <Button variant="outline" className="text-base md:text-xl w-full sm:w-auto">{hero.cta_reserva}</Button>
          </motion.div>
        </motion.div>

        {/* Right Side: Featured Product (Visible on Desktop, Condensed on Mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative group w-full max-w-[320px] lg:max-w-[400px]"
        >
          {/* Decorative Background Square */}
          <div className="absolute -inset-4 border-2 border-primary/20 translate-x-3 translate-y-3 lg:translate-x-6 lg:translate-y-6 transition-transform duration-300"></div>
          
          <div className="relative bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 shadow-2xl transition-all duration-250">
            {/* Tag */}
            <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-primary text-white p-3 lg:p-4 font-serif text-lg lg:text-xl rotate-12 shadow-lg group-hover:scale-110 transition-transform z-30">
              #01 SEMANA
            </div>

            <div className="aspect-square overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <img 
                src={featured.image} 
                alt={featured.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
              />
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] lg:text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1">// MOST ORDERED</p>
                  <h3 className="text-2xl lg:text-3xl font-serif text-text-bright uppercase">{featured.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl lg:text-2xl font-serif text-primary">{featured.price}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-zinc-200 dark:bg-white/10"></div>
              
              <p className="text-[10px] lg:text-xs text-text-dim uppercase tracking-widest leading-relaxed line-clamp-2">
                {featured.description}
              </p>
              
              <button className="flex items-center space-x-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] pt-2 group/btn">
                <span>Ver detalles del platillo</span>
                <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Floating Stats - Hidden on very small screens */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 bg-background border border-primary/20 p-3 lg:p-4 shadow-xl hidden sm:flex items-center space-x-4 z-20"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[7px] lg:text-[8px] uppercase tracking-widest text-text-dim font-bold">{hero.stats_label}</p>
              <p className="text-xs lg:text-sm font-bold text-text-bright">{featured.totalOrders > 0 ? `+${featured.totalOrders} Pedidos` : hero.stats_value}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Vertical Decorative Element */}
      <div className="absolute top-1/2 right-6 lg:right-12 -translate-y-1/2 vertical-text hidden sm:block opacity-20 pointer-events-none">
        <span className="text-text-bright tracking-[1.5em] lg:tracking-[2em] uppercase text-[8px] lg:text-xs">{hero.established}</span>
      </div>
    </section>
  );
};

export default HeroSection;
