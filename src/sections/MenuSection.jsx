import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

const MenuSection = () => {
  const { addToCart } = useCart();
  const { menu = [], cmsData } = useAdmin();
  
  // Extract first 3 products for the home page preview
  const dishes = menu.flatMap(c => c.products || []).slice(0, 3);

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
            <p class="footer-prices-notice">PRECIOS EXPRESADOS EN MILES</p>
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
              Nuestra <span className="text-primary italic">Carta</span>
            </h2>
            <p className="text-text-dim tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm uppercase font-bold">Hecho con amor // Sabor real // Para compartir</p>
          </motion.div>
          <div className="hidden md:block w-1/3 h-px bg-zinc-200 dark:bg-white/10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-surface border border-zinc-200 dark:border-zinc-800/80 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 font-serif text-3xl text-zinc-200 dark:text-white/5 font-bold">
                0{index + 1}
              </div>
              
              {dish.image && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 border-2 border-primary bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.15)] group relative">
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" 
                  />
                </div>
              )}
              
              <div className="flex-grow flex flex-col gap-3 min-w-0 w-full text-center">
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-xl md:text-2xl font-serif text-text-bright uppercase tracking-wide leading-none">{dish.name}</h3>
                  <span className="text-primary font-bold font-serif text-xl md:text-2xl leading-none mt-1">${dish.price}</span>
                </div>
                
                <p className="text-text-dim text-[11px] md:text-xs leading-relaxed px-2">
                  {dish.description}
                </p>
                
                <button 
                  onClick={() => addToCart(dish)}
                  className="mt-auto w-full border-2 border-primary/20 py-3 uppercase tracking-widest text-[9px] md:text-[10px] font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag size={12} />
                  <span>Agregar al pedido</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 flex flex-col md:flex-row justify-center gap-4 md:gap-6">
          <Link to="/menu" className="btn-primary">Ver Carta Completa</Link>
          <button onClick={handleDownloadPDF} className="btn-outline">Descargar Menú PDF</button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
