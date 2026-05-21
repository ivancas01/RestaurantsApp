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
  const { menu = [], cmsData } = useAdmin();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = () => {
    const brandName = cmsData?.brand?.name || 'URBAN STREET';
    const brandTagline = cmsData?.brand?.tagline || 'Premium Urban Gastronomy';
    const address = cmsData?.contact?.address || '';
    const phone = cmsData?.contact?.phone || '';
    
    const themes = {
      rose: { primary: '#e11d48', dark: '#be123c' },
      amber: { primary: '#f59e0b', dark: '#d97706' },
      emerald: { primary: '#10b981', dark: '#059669' },
      blue: { primary: '#3b82f6', dark: '#2563eb' },
      violet: { primary: '#8b5cf6', dark: '#7c3aed' },
      orange: { primary: '#ea580c', dark: '#c2410c' }
    };
    const selectedTheme = cmsData?.brand?.theme || 'rose';
    const themeColors = themes[selectedTheme] || themes.rose;

    const printWindow = window.open('', '_blank');
    
    let categoriesHtml = '';
    menu.forEach((cat, catIndex) => {
      let productsHtml = '';
      (cat.products || []).forEach(prod => {
        const imgHtml = prod.image ? `
          <div class="menu-item-image-wrapper">
            <img src="${prod.image}" alt="${prod.name}" class="menu-item-img" />
          </div>
        ` : '';

        productsHtml += `
          <div class="menu-item">
            <div class="menu-item-body">
              ${imgHtml}
              <div class="menu-item-details">
                <div class="menu-item-header">
                  <span class="menu-item-name">${prod.name}</span>
                  <span class="menu-item-dots"></span>
                  <span class="menu-item-price">$${prod.price}</span>
                </div>
                <p class="menu-item-desc">${prod.description || ''}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      const patIdA = `checkers-a-${catIndex}`;
      const patIdB = `checkers-b-${catIndex}`;
      const patIdC = `checkers-c-${catIndex}`;

      categoriesHtml += `
        <div class="menu-category">
          <div class="category-header">
            <div class="checkerboard-pattern">
              <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="${patIdA}" width="12" height="12" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="var(--primary)" />
                    <rect x="6" y="6" width="6" height="6" fill="var(--primary)" />
                  </pattern>
                </defs>
                <rect width="100%" height="12" fill="url(#${patIdA})" />
              </svg>
            </div>
            <h2 class="category-title">${cat.name}</h2>
            <p class="category-subtitle">PARA COMPARTIR Y DISFRUTAR</p>
            <div class="checkerboard-pattern">
              <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="${patIdB}" width="12" height="12" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="var(--primary)" />
                    <rect x="6" y="6" width="6" height="6" fill="var(--primary)" />
                  </pattern>
                </defs>
                <rect width="100%" height="12" fill="url(#${patIdB})" />
              </svg>
            </div>
          </div>
          
          <div class="menu-items-grid">
            ${productsHtml}
          </div>

          <div class="category-footer">
            <div class="checkerboard-pattern">
              <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="${patIdC}" width="12" height="12" patternUnits="userSpaceOnUse">
                    <rect width="6" height="6" fill="var(--primary)" />
                    <rect x="6" y="6" width="6" height="6" fill="var(--primary)" />
                  </pattern>
                </defs>
                <rect width="100%" height="12" fill="url(#${patIdC})" />
              </svg>
            </div>
            <p class="footer-prices-notice">Precios en miles</p>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Carta - ${brandName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: letter;
            margin: 0;
          }
          :root {
            --primary: ${themeColors.primary};
            --primary-dark: ${themeColors.dark};
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #18181b;
            background-color: #fdfbf7; /* Warm cream vintage paper background */
            margin: 0;
            padding: 15mm 20mm 20mm 20mm;
            font-size: 10px;
            line-height: 1.5;
          }
          .menu-container {
            max-width: 850px;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .menu-header {
            text-align: center;
            border-top: 4px double #18181b;
            border-bottom: 4px double #18181b;
            padding: 20px 0;
            margin-bottom: 30px;
          }
          .restaurant-name {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 56px;
            letter-spacing: 4px;
            margin: 0 0 5px 0;
            color: var(--primary);
            line-height: 1;
            text-transform: uppercase;
          }
          .restaurant-tagline {
            font-size: 12px;
            letter-spacing: 6px;
            color: #52525b;
            margin: 0 0 10px 0;
            font-weight: 700;
            text-transform: uppercase;
          }
          .restaurant-info {
            font-size: 9px;
            letter-spacing: 2px;
            color: #71717a;
            margin: 0;
            text-transform: uppercase;
          }
          .menu-category {
            margin-bottom: 40px;
          }
          .menu-category:not(:first-of-type) {
            page-break-before: always;
            padding-top: 15mm;
            box-sizing: border-box;
          }
          .category-header {
            text-align: center;
            margin-bottom: 30px;
            page-break-after: avoid;
          }
          .category-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 42px;
            letter-spacing: 3px;
            margin: 10px 0 2px 0;
            color: var(--primary);
            text-transform: uppercase;
            line-height: 1;
          }
          .category-subtitle {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 18px;
            letter-spacing: 4px;
            margin: 0 0 10px 0;
            color: #18181b;
            text-transform: uppercase;
            line-height: 1;
          }
          .checkerboard-pattern {
            width: 100%;
            display: block;
            margin: 5px 0;
          }
          .menu-items-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 24px 40px;
          }
          @media (max-width: 600px) {
            .menu-items-grid {
              grid-template-cols: 1fr;
            }
          }
          .menu-item {
            page-break-inside: avoid;
            margin-bottom: 5px;
            border-bottom: 1px dashed rgba(24, 24, 27, 0.1);
            padding-bottom: 12px;
          }
          .menu-item-body {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .menu-item-image-wrapper {
            width: 64px;
            height: 64px;
            flex-shrink: 0;
            border: 2px solid var(--primary);
            background-color: #faf8f5;
            overflow: hidden;
            box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.12);
          }
          .menu-item-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .menu-item-details {
            flex-grow: 1;
            min-width: 0;
          }
          .menu-item-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
          }
          .menu-item-name {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 1px;
            color: var(--primary);
            text-transform: uppercase;
          }
          .menu-item-dots {
            flex-grow: 1;
            border-bottom: 1px dotted rgba(24, 24, 27, 0.2);
            margin: 0 8px;
          }
          .menu-item-price {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #18181b;
          }
          .menu-item-desc {
            font-size: 11px;
            color: #52525b;
            margin: 4px 0 0 0;
            line-height: 1.4;
            letter-spacing: 0.5px;
          }
          .category-footer {
            margin-top: 30px;
            text-align: center;
            page-break-inside: avoid;
          }
          .footer-prices-notice {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 12px;
            letter-spacing: 2px;
            color: var(--primary);
            margin: 8px 0 0 0;
            font-weight: 700;
          }
          .menu-footer {
            margin-top: 40px;
            text-align: center;
            border-top: 1px solid rgba(24, 24, 27, 0.1);
            padding-top: 20px;
            font-size: 9px;
            letter-spacing: 3px;
            color: #71717a;
            text-transform: uppercase;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="menu-container">
          <header class="menu-header">
            <h1 class="restaurant-name">${brandName}</h1>
            <p class="restaurant-tagline">${brandTagline}</p>
            <p class="restaurant-info">${address} | TEL: ${phone}</p>
          </header>
          
          <main class="menu-content">
            ${categoriesHtml}
          </main>
          
          <footer class="menu-footer">
            --- PARA DOMICILIOS LLAMA O ESCRIBE AL WHATSAPP: ${phone} ---
          </footer>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
              <p className="text-text-dim tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs uppercase mt-4 font-bold">Nuestros deliciosos platos</p>
            </motion.div>
            
            <div className="flex flex-col gap-2 mt-6 md:mb-2 w-full sm:w-auto items-center sm:items-end">
              <Link to="/" className="flex items-center space-x-2 text-text-dim hover:text-primary transition-colors uppercase tracking-widest text-[10px] md:text-xs font-bold group w-full sm:w-auto justify-center sm:justify-end py-2">
                <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
                <span>Regresar al Inicio</span>
              </Link>
              <button 
                onClick={handleDownloadPDF}
                className="btn-outline px-6 py-2.5 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-primary hover:text-white transition-all w-full sm:w-auto"
              >
                Descargar Carta PDF
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-24 md:space-y-36">
            {menu.map((category, catIndex) => (
              <div key={category.id} id={category.id} className="scroll-mt-28">
                {/* Rebranded Gourmet Category Header on Screen */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.4 }}
                   className="text-center max-w-xl mx-auto mb-12 md:mb-16 px-4"
                >
                  <div className="text-primary mb-3">
                    <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`checkers-s-a-${catIndex}`} width="12" height="12" patternUnits="userSpaceOnUse">
                          <rect width="6" height="6" fill="currentColor" />
                          <rect x="6" y="6" width="6" height="6" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="12" fill={`url(#checkers-s-a-${catIndex})`} />
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif uppercase text-text-bright tracking-wider leading-none mb-2">{category.name}</h2>
                  <p className="text-primary uppercase tracking-[0.2em] font-bold text-xs md:text-sm mb-3">PARA COMPARTIR Y DISFRUTAR</p>
                  <div className="text-primary">
                    <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`checkers-s-b-${catIndex}`} width="12" height="12" patternUnits="userSpaceOnUse">
                          <rect width="6" height="6" fill="currentColor" />
                          <rect x="6" y="6" width="6" height="6" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="12" fill={`url(#checkers-s-b-${catIndex})`} />
                    </svg>
                  </div>
                </motion.div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  {(category.products || []).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-surface border border-zinc-200 dark:border-zinc-800/80 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-center gap-6"
                    >
                      {item.image && (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 border-2 border-primary bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.15)] group relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-100" 
                          />
                        </div>
                      )}
                      
                      <div className="flex-grow min-w-0 w-full">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-xl md:text-2xl font-serif text-text-bright uppercase tracking-wide leading-none">{item.name}</h3>
                          <span className="flex-grow border-b border-dashed border-zinc-300 dark:border-zinc-700/80 mx-2 self-end"></span>
                          <span className="text-primary font-bold font-serif text-xl md:text-2xl leading-none">${item.price}</span>
                        </div>
                        
                        <p className="text-text-dim text-[11px] md:text-xs leading-relaxed mt-3 pr-2">
                          {item.description}
                        </p>
                        
                        <button 
                          onClick={() => addToCart(item)}
                          className="mt-4 flex items-center space-x-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] pt-1 group/btn hover:opacity-85 transition-opacity"
                        >
                          <ShoppingBag size={12} />
                          <span>Agregar al pedido</span>
                        </button>
                      </div>
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
