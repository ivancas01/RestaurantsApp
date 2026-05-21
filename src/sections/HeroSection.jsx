import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowRight, 
  ShoppingCart, 
  ChefHat, 
  Flame, 
  Soup, 
  Coffee, 
  Wine, 
  Utensils 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';

// Dynamic Fallback Image
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1555392816-4aa3b306e041?q=80&w=1920&auto=format&fit=crop";

const ICON_MAP = {
  ChefHat,
  Flame,
  Soup,
  Coffee,
  Wine,
  Utensils
};

const FLOATING_ELEMENTS = [
  { type: 'ChefHat', top: '12%', left: '8%', size: 36, delay: 0 },
  { type: 'Flame', top: '22%', left: '42%', size: 28, delay: 2 },
  { type: 'Soup', top: '68%', left: '12%', size: 32, delay: 1 },
  { type: 'Coffee', top: '78%', left: '46%', size: 28, delay: 3 },
  { type: 'Wine', top: '48%', left: '88%', size: 34, delay: 0.5 },
  { type: 'Utensils', top: '10%', left: '68%', size: 32, delay: 1.5 },
  { type: 'ChefHat', top: '82%', left: '84%', size: 40, delay: 2.5 },
  { type: 'Flame', top: '58%', left: '4%', size: 26, delay: 4 },
];

const HeroSection = () => {
  const { menu = [], cmsData = {} } = useAdmin() || {};
  
  const allProducts = React.useMemo(() => menu.flatMap(cat => cat.products || []), [menu]);
  const [randomProduct, setRandomProduct] = React.useState(null);

  React.useEffect(() => {
    if (allProducts.length > 0 && !randomProduct) {
      const random = allProducts[Math.floor(Math.random() * allProducts.length)];
      setRandomProduct(random);
    }
  }, [allProducts, randomProduct]);

  const hero = cmsData?.hero || {
    title: "Sabor Urbano, Alma // Gourmet",
    subtitle: "Donde la calle se encuentra con la alta cocina.",
    cta_menu: "Ver Carta Completa",
    cta_reserva: "Reservar Mesa",
    featured_name: "The Architect",
    featured_price: "22",
    featured_desc: "Wagyu A5, Cheddar Envejecido, Cebolla al Bourbon y pan brioche artesanal.",
    stats_label: "¡Los más pedidos!",
    stats_value: "+124 Pedidos",
    established: `${cmsData?.brand?.name || 'Urban Street'} // Desde 2026`,
    featured_image: DEFAULT_HERO_IMAGE
  };

  const featured = randomProduct || {
    name: hero.featured_name,
    price: hero.featured_price,
    description: hero.featured_desc,
    image: hero.featured_image,
    totalOrders: 0
  };

  // Formatting title: "Main Part // Italic Part"
  const safeTitle = hero.title || "Sabor Urbano, Alma // Gourmet";
  const [mainTitle, italicTitle] = safeTitle.includes('//') ? safeTitle.split('//').map(t => t.trim()) : [safeTitle, ''];

  return (
    <section id="inicio" className="relative min-h-screen w-full overflow-hidden flex items-center bg-background pt-28 md:pt-36 pb-12 md:pb-20">
      {/* Background Video - Urban/Street Vibe */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale opacity-25 dark:opacity-40"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-flambe-dish-in-a-pan-42289-large.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10 dark:opacity-20 z-10"></div>
        
        {/* Floating Decorative Food Icons */}
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
          {FLOATING_ELEMENTS.map((item, index) => {
            const IconComponent = ICON_MAP[item.type];
            return (
              <motion.div
                key={index}
                className="absolute text-primary/30 dark:text-primary/20"
                style={{ top: item.top, left: item.left }}
                animate={{
                  y: [0, -35, 0],
                  x: [0, 15, 0],
                  rotate: [0, 360],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 14 + index * 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item.delay
                }}
              >
                <IconComponent size={item.size} strokeWidth={1.5} />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="container relative z-20 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 xl:gap-24">
        {/* Left Side: Text Content */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="border-l-0 lg:border-l-4 xl:border-l-6 border-primary pl-0 lg:pl-5 xl:pl-6 max-w-3xl text-center lg:text-left"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold mb-2 block text-[10px] md:text-xs"
          >
            {hero.established}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-text-bright uppercase tracking-wider leading-[0.95]"
          >
            {mainTitle} {italicTitle && <><br /><span className="text-primary italic">{italicTitle}</span></>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text-dim max-w-lg mb-6 text-sm sm:text-base md:text-lg lg:text-xl border-t border-zinc-200 dark:border-white/10 pt-3 uppercase tracking-wider leading-relaxed mx-auto lg:mx-0"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
          >
            <Link to="/menu" className="w-full sm:w-auto">
              <Button variant="primary" className="text-xs sm:text-sm w-full py-3 px-10">{hero.cta_menu}</Button>
            </Link>
            <a href="#reserva" className="w-full sm:w-auto">
              <Button variant="outline" className="text-xs sm:text-sm w-full py-3 px-10">{hero.cta_reserva}</Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Right Side: Featured Product (Visible on Desktop, Condensed on Mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative group w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[420px]"
        >
          {/* Decorative Background Square */}
          <div className="absolute -inset-3 border-2 border-primary/20 translate-x-2 translate-y-2 lg:translate-x-4 lg:translate-y-4 transition-transform duration-300"></div>
          
          <div className="relative bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 shadow-xl transition-all duration-250">
            {/* Tag */}
            <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 bg-primary text-white p-2 lg:p-3 font-serif text-sm lg:text-base rotate-12 shadow-md group-hover:scale-105 transition-transform z-30">
              #01 SEMANA
            </div>

            <div className="aspect-square overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {featured.image ? (
                <img 
                  src={featured.image} 
                  alt={featured.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-dim/20 p-6 text-center">
                  <ShoppingCart size={40} strokeWidth={1} className="mb-2" />
                  <p className="text-[8px] uppercase tracking-widest font-bold">¡Elige un plato en el menú para destacarlo aquí!</p>
                </div>
              )}
            </div>

            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-primary font-bold mb-0.5">// EL MÁS PEDIDO</p>
                  <h3 className="text-2xl lg:text-3xl font-serif text-text-bright uppercase">{featured.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl lg:text-2xl font-serif text-primary">{featured.price}</p>
                </div>
              </div>
              
              <div className="w-full h-px bg-zinc-200 dark:bg-white/10"></div>
              
              <p className="text-[9px] lg:text-xs text-text-dim uppercase tracking-widest leading-relaxed line-clamp-2">
                {featured.description}
              </p>
              
              <button className="flex items-center space-x-2 text-primary font-bold uppercase tracking-[0.2em] text-[9px] pt-1 group/btn">
                <span>Ver detalles del platillo</span>
                <ArrowRight size={10} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Floating Stats - Hidden on very small screens */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-background border border-primary/20 p-2 lg:p-3 shadow-lg hidden sm:flex items-center space-x-3 z-20"
          >
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp size={12} />
            </div>
            <div>
              <p className="text-[6px] lg:text-[7px] uppercase tracking-widest text-text-dim font-bold">{hero.stats_label}</p>
              <p className="text-[10px] lg:text-xs font-bold text-text-bright">{featured.totalOrders > 0 ? `+${featured.totalOrders} Pedidos` : hero.stats_value}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Vertical Decorative Element */}
      <div className="absolute top-1/2 right-4 lg:right-8 -translate-y-1/2 vertical-text hidden sm:block opacity-20 pointer-events-none">
        <span className="text-text-bright tracking-[1.5em] lg:tracking-[2em] uppercase text-[7px] lg:text-[10px]">{hero.established}</span>
      </div>
    </section>
  );
};

export default HeroSection;
