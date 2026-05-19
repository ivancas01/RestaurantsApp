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
    menu.forEach(cat => {
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
                  <span class="menu-item-price">${prod.price}</span>
                </div>
                <p class="menu-item-desc">${prod.description || ''}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      categoriesHtml += `
        <div class="menu-category">
          <h2 class="category-title">${cat.name}</h2>
          <div class="menu-items-grid">
            ${productsHtml}
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
            margin: 0; /* Removes default browser headers & footers (URL, Page title, etc.) */
          }
          :root {
            --primary: ${themeColors.primary};
            --primary-dark: ${themeColors.dark};
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #18181b;
            background-color: #fff;
            margin: 0;
            padding: 15mm 20mm 20mm 20mm; /* Consistent margins on Page 1 */
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
            font-size: 52px;
            letter-spacing: 4px;
            margin: 0 0 5px 0;
            color: #18181b;
            line-height: 1;
            text-transform: uppercase;
          }
          .restaurant-tagline {
            font-size: 11px;
            letter-spacing: 6px;
            color: #52525b;
            margin: 0 0 10px 0;
            font-weight: 700;
            text-transform: uppercase;
          }
          .restaurant-info {
            font-size: 8px;
            letter-spacing: 2px;
            color: #71717a;
            margin: 0;
            text-transform: uppercase;
          }
          .menu-category {
            margin-bottom: 40px;
          }
          .menu-category:not(:first-of-type) {
            page-break-before: always; /* Split each category to a new page */
            padding-top: 15mm; /* Safe consistent top margin on Pages 2, 3, etc. */
            box-sizing: border-box;
          }
          .category-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 26px;
            letter-spacing: 2px;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 5px;
            margin: 0 0 20px 0;
            color: var(--primary);
            text-transform: uppercase;
            page-break-after: avoid;
          }
          .menu-items-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px 40px;
          }
          @media (max-width: 600px) {
            .menu-items-grid {
              grid-template-cols: 1fr;
            }
          }
          .menu-item {
            page-break-inside: avoid;
            margin-bottom: 5px;
          }
          .menu-item-body {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .menu-item-image-wrapper {
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            border: 1px solid #e4e4e7;
            background-color: #f4f4f5;
            overflow: hidden;
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
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .menu-item-dots {
            flex-grow: 1;
            border-bottom: 1px dotted #a1a1aa;
            margin: 0 8px;
          }
          .menu-item-price {
            font-weight: 700;
            font-size: 11px;
            color: var(--primary);
          }
          .menu-item-desc {
            font-size: 8px;
            color: #52525b;
            margin: 4px 0 0 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .menu-footer {
            margin-top: 40px;
            text-align: center;
            border-top: 1px solid #e4e4e7;
            padding-top: 20px;
            font-size: 8px;
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
              <p className="text-text-dim tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs uppercase mt-4 font-bold">Urban Street // Operational Menu</p>
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
