import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Layout, Type, Phone, Save, RotateCcw, AlertTriangle, Upload, X, Star } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ImageUpload = ({ label, value, onChange, multiple = false }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (multiple) {
          onChange([...(value || []), reader.result]);
        } else {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    if (multiple) {
      onChange(value.filter((_, i) => i !== index));
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-4 w-full">
      <label className="text-[10px] font-bold uppercase tracking-widest text-primary">{label}</label>
      <div className="flex flex-wrap gap-4">
        {multiple ? (
          value?.map((img, i) => (
            <div key={i} className="relative w-24 h-24 border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden group shadow-lg">
              <img src={img} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-accent/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          value && (
            <div className="relative w-32 h-32 border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden group shadow-xl">
              <img src={value} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage()}
                className="absolute inset-0 bg-accent/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          )
        )}
        <label className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors text-text-dim hover:text-primary group/upload">
          <Upload size={24} className="group-hover/upload:-translate-y-1 transition-transform" />
          <span className="text-[8px] font-bold uppercase mt-2">Subir Imagen</span>
          <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
};

const CMSSection = ({ title, icon, children, onSave, onReset }) => (
  <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 space-y-8 relative group">
    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-4">
       <div className="flex items-center space-x-4">
          <div className="text-primary">{icon}</div>
          <h2 className="text-2xl font-serif uppercase tracking-widest">{title}</h2>
       </div>
       <div className="flex space-x-2">
          <button onClick={onReset} className="p-2 text-text-dim hover:text-primary transition-colors"><RotateCcw size={16}/></button>
          <button onClick={onSave} className="p-2 bg-primary text-white hover:bg-primary-dark transition-all"><Save size={16}/></button>
       </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       {children}
    </div>
  </div>
);

const CMSManager = () => {
  const { cmsData, updateCMS, getMostOrderedProduct, fetchCMSContent } = useAdmin();

  React.useEffect(() => {
    fetchCMSContent();
  }, []);
  
  // Local states for each section to avoid unnecessary context re-renders while typing
  const [brand, setBrand] = useState(cmsData.brand || { name: 'URBAN STREET', tagline: 'Control Center', theme: 'rose' });
  const [hero, setHero] = useState(cmsData.hero);
  const [about, setAbout] = useState(cmsData.about);
  const [contact, setContact] = useState(cmsData.contact || { opening_time: '08:00', closing_time: '22:00', closed_image: '' });
  const [resText, setResText] = useState(cmsData.reservations);
  const [footer, setFooter] = useState(cmsData.footer || { description: '', socials: [], copyright: '' });

  const { showNotification } = useNotification();

  // Sync local state when cmsData is loaded from API
  React.useEffect(() => {
    if (cmsData.brand) setBrand(cmsData.brand);
    if (cmsData.hero) setHero(cmsData.hero);
    if (cmsData.about) setAbout(cmsData.about);
    if (cmsData.contact) setContact(cmsData.contact);
    if (cmsData.reservations) setResText(cmsData.reservations);
    if (cmsData.footer) setFooter(cmsData.footer);
  }, [cmsData]);

  const saveSection = (section, data) => {
    updateCMS(section, data);
    showNotification(`Sección ${section.toUpperCase()} actualizada correctamente.`);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Diseño y <span className="text-primary italic">Contenidos</span>
          </h1>
          <p className="text-text-dim tracking-[0.4em] text-xs uppercase mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Editar textos e imágenes de la página web
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center space-x-3 max-w-sm">
           <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
           <p className="text-[8px] uppercase font-bold text-yellow-500 tracking-widest leading-relaxed">
             ¡Importante! Todo cambio guardado aquí se publicará inmediatamente en la página web para tus clientes.
           </p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Brand Section */}
        <CMSSection 
          title="Identidad y Marca" 
          icon={<Star className="text-primary" size={24} />}
          onSave={() => saveSection('brand', brand)}
          onReset={() => {
             const originalBrand = cmsData.brand || { name: 'URBAN STREET', tagline: 'Control Center', theme: 'rose' };
             setBrand(originalBrand);
             
             // Revert live preview
             const themes = {
               rose: { primary: '#e11d48', dark: '#be123c' },
               amber: { primary: '#f59e0b', dark: '#d97706' },
               emerald: { primary: '#10b981', dark: '#059669' },
               blue: { primary: '#3b82f6', dark: '#2563eb' },
               violet: { primary: '#8b5cf6', dark: '#7c3aed' },
               orange: { primary: '#ea580c', dark: '#c2410c' }
             };
             const themeColors = themes[originalBrand.theme || 'rose'] || themes.rose;
             document.documentElement.style.setProperty('--primary', themeColors.primary);
             document.documentElement.style.setProperty('--primary-dark', themeColors.dark);
             document.documentElement.style.setProperty('--primary-shadow-10', themeColors.primary + '1a');
             document.documentElement.style.setProperty('--primary-shadow-20', themeColors.primary + '33');
             document.documentElement.style.setProperty('--primary-shadow-30', themeColors.primary + '4d');
          }}
        >
           <div className="space-y-4">
              <Input label="Nombre del Restaurante" value={brand.name} onChange={(e) => setBrand({...brand, name: e.target.value.toUpperCase()})} />
              <Input label="Frase del Panel de Control" value={brand.tagline} onChange={(e) => setBrand({...brand, tagline: e.target.value})} />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Tema de Color de la Interfaz</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                 {[
                    { id: 'rose', label: 'Fresa (Rojo)', color: 'bg-rose-600' },
                    { id: 'amber', label: 'Dorado (Ámbar)', color: 'bg-amber-500' },
                    { id: 'emerald', label: 'Menta (Verde)', color: 'bg-emerald-500' },
                    { id: 'blue', label: 'Océano (Azul)', color: 'bg-blue-500' },
                    { id: 'violet', label: 'Lujo (Violeta)', color: 'bg-violet-500' },
                    { id: 'orange', label: 'Vibrante (Naranja)', color: 'bg-orange-500' }
                 ].map(t => (
                    <button 
                       key={t.id} 
                       type="button"
                       onClick={() => {
                          setBrand({...brand, theme: t.id});
                          
                          // Instant Live Preview
                          const themes = {
                            rose: { primary: '#e11d48', dark: '#be123c' },
                            amber: { primary: '#f59e0b', dark: '#d97706' },
                            emerald: { primary: '#10b981', dark: '#059669' },
                            blue: { primary: '#3b82f6', dark: '#2563eb' },
                            violet: { primary: '#8b5cf6', dark: '#7c3aed' },
                            orange: { primary: '#ea580c', dark: '#c2410c' }
                          };
                          const themeColors = themes[t.id] || themes.rose;
                          document.documentElement.style.setProperty('--primary', themeColors.primary);
                          document.documentElement.style.setProperty('--primary-dark', themeColors.dark);
                          document.documentElement.style.setProperty('--primary-shadow-10', themeColors.primary + '1a');
                          document.documentElement.style.setProperty('--primary-shadow-20', themeColors.primary + '33');
                          document.documentElement.style.setProperty('--primary-shadow-30', themeColors.primary + '4d');
                       }}
                       className={`flex items-center space-x-2 p-2 border-2 transition-all hover:bg-zinc-100 dark:hover:bg-white/5 ${brand.theme === t.id ? 'border-primary bg-zinc-50 dark:bg-white/5 shadow-md' : 'border-zinc-200 dark:border-zinc-800'}`}
                    >
                       <span className={`w-3.5 h-3.5 rounded-full ${t.color} flex-shrink-0`}></span>
                       <span className="text-[9px] font-bold uppercase tracking-wider text-text-bright">{t.label}</span>
                    </button>
                 ))}
              </div>
           </div>
        </CMSSection>

        {/* Hero Section */}
        <CMSSection 
          title="Página de Inicio // Bienvenida" 
          icon={<Layout size={24}/>} 
          onSave={() => saveSection('hero', hero)}
          onReset={() => setHero(cmsData.hero)}
        >
           <div className="space-y-4">
              <Input label="Título de Bienvenida" value={hero.title} onChange={(e) => setHero({...hero, title: e.target.value})} />
              <Input label="Subtítulo de Bienvenida" value={hero.subtitle} onChange={(e) => setHero({...hero, subtitle: e.target.value})} />
              <Input label="Año de Fundación / Texto Vertical" value={hero.established} onChange={(e) => setHero({...hero, established: e.target.value})} />
           </div>
           <div className="space-y-4">
              <Input label="Texto de Botón 'Ver Carta'" value={hero.cta_menu} onChange={(e) => setHero({...hero, cta_menu: e.target.value})} />
              <Input label="Texto de Botón 'Reservar Mesa'" value={hero.cta_reserva} onChange={(e) => setHero({...hero, cta_reserva: e.target.value})} />
           </div>
           
           <div className="border-t-2 border-zinc-100 dark:border-white/5 pt-6 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">// PLATO DESTACADO EN INICIO</h3>
                {getMostOrderedProduct() && (
                  <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
                    <Star size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Auto-Detectado: {getMostOrderedProduct().name}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p className="text-[9px] uppercase font-bold text-text-dim leading-relaxed">
                    Si aún no tienes pedidos suficientes, mostraremos este plato como sugerido de forma predeterminada.
                  </p>
                  <ImageUpload label="Foto del plato" value={hero.featured_image} onChange={(val) => setHero({...hero, featured_image: val})} />
                  <Input label="Nombre del plato" value={hero.featured_name} onChange={(e) => setHero({...hero, featured_name: e.target.value})} />
                </div>
                <div className="space-y-6">
                  <Input label="Precio" value={hero.featured_price} onChange={(e) => setHero({...hero, featured_price: e.target.value})} />
                  <Input label="Descripción" value={hero.featured_desc} onChange={(e) => setHero({...hero, featured_desc: e.target.value})} />
                  <Input label="Etiqueta (Ej. Más pedido, Recomendado)" value={hero.stats_label} onChange={(e) => setHero({...hero, stats_label: e.target.value})} />
                  <Input label="Información adicional (Ej. 100 vendidos)" value={hero.stats_value} onChange={(e) => setHero({...hero, stats_value: e.target.value})} />
                </div>
              </div>
           </div>
        </CMSSection>

        {/* About Section */}
        <CMSSection 
          title="Nuestra Historia // Quiénes Somos" 
          icon={<Type size={24}/>} 
          onSave={() => saveSection('about', about)}
          onReset={() => setAbout(cmsData.about)}
        >
           <div className="space-y-4">
              <Input label="Título Sección" value={about.title} onChange={(e) => setAbout({...about, title: e.target.value})} />
              <Input label="Valor Insignia (Años)" value={about.years_value} onChange={(e) => setAbout({...about, years_value: e.target.value})} />
              <Input label="Texto Insignia" value={about.years_label} onChange={(e) => setAbout({...about, years_label: e.target.value})} />
           </div>
           
           <div className="md:col-span-1">
              <ImageUpload 
                label="Galería de Fotos (Múltiple)" 
                value={about.images} 
                multiple={true}
                onChange={(val) => setAbout({...about, images: val})} 
              />
           </div>

           <div className="flex flex-col space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Contenido de Historia</label>
              <textarea 
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-background border-2 border-zinc-200 dark:border-zinc-800 text-text-bright text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all min-h-[100px]"
                value={about.content}
                onChange={(e) => setAbout({...about, content: e.target.value})}
              />
           </div>

           <div className="border-t-2 border-zinc-100 dark:border-white/5 pt-6 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Título Característica 1" value={about.feature_1_title} onChange={(e) => setAbout({...about, feature_1_title: e.target.value})} />
                <Input label="Desc. Característica 1" value={about.feature_1_desc} onChange={(e) => setAbout({...about, feature_1_desc: e.target.value})} />
              </div>
              <div className="space-y-4">
                <Input label="Título Característica 2" value={about.feature_2_title} onChange={(e) => setAbout({...about, feature_2_title: e.target.value})} />
                <Input label="Desc. Característica 2" value={about.feature_2_desc} onChange={(e) => setAbout({...about, feature_2_desc: e.target.value})} />
              </div>
           </div>
        </CMSSection>

        {/* Contact Section */}
        <CMSSection 
          title="Contacto y Horarios" 
          icon={<Phone size={24}/>} 
          onSave={() => saveSection('contact', contact)}
          onReset={() => setContact(cmsData.contact)}
        >
           <div className="space-y-4">
              <Input label="Dirección" value={contact.address} onChange={(e) => setContact({...contact, address: e.target.value})} />
              <Input label="Teléfono de Contacto" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} />
           </div>
           <div className="space-y-4">
              <Input label="Correo Electrónico" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} />
              <Input label="Instagram" value={contact.instagram} onChange={(e) => setContact({...contact, instagram: e.target.value})} />
              <Input label="Indicativo de País (Ej. 57 para Colombia)" value={contact.whatsapp_prefix || ''} onChange={(e) => setContact({...contact, whatsapp_prefix: e.target.value})} />
           </div>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Apertura" type="time" value={contact.opening_time} onChange={(e) => setContact({...contact, opening_time: e.target.value})} />
                 <Input label="Cierre" type="time" value={contact.closing_time} onChange={(e) => setContact({...contact, closing_time: e.target.value})} />
              </div>
              <ImageUpload label="Imagen de cocina cerrada" value={contact.closed_image} onChange={(val) => setContact({...contact, closed_image: val})} />
           </div>
        </CMSSection>

        {/* Reservations Section */}
        <CMSSection 
          title="Reservas" 
          icon={<Layout size={24}/>} 
          onSave={() => saveSection('reservations', resText)}
          onReset={() => setResText(cmsData.reservations)}
        >
           <div className="space-y-4">
              <Input label="Título de Reservas" value={resText.title} onChange={(e) => setResText({...resText, title: e.target.value})} />
              <Input label="Frase corta o invitación" value={resText.subtitle} onChange={(e) => setResText({...resText, subtitle: e.target.value})} />
           </div>
           <div className="space-y-4">
              <Input label="Texto informativo para clientes" value={resText.help_text} onChange={(e) => setResText({...resText, help_text: e.target.value})} />
           </div>
        </CMSSection>

        {/* Footer Section */}
        <CMSSection 
          title="Pie de Página" 
          icon={<Monitor size={24}/>} 
          onSave={() => saveSection('footer', footer)}
          onReset={() => setFooter(cmsData.footer)}
        >
           <div className="space-y-4 md:col-span-2">
              <Input label="Descripción corta de tu restaurante" value={footer.description} onChange={(e) => setFooter({...footer, description: e.target.value})} />
              <Input label="Derechos reservados / Créditos" value={footer.copyright} onChange={(e) => setFooter({...footer, copyright: e.target.value})} />
           </div>
           
           <div className="md:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-t border-zinc-100 dark:border-white/5 pt-6">
                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">// TUS REDES SOCIALES</h3>
                <Button onClick={() => setFooter({...footer, socials: [...footer.socials, { name: '', url: '' }]})} className="py-1 px-3 text-[8px]">+ Añadir Red Social</Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {footer.socials.map((social, i) => (
                  <div key={i} className="flex gap-4 items-end bg-black/5 p-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex-1">
                      <Input label="Nombre de la red (Ej. Instagram)" value={social.name} onChange={(e) => {
                        const newSocials = [...footer.socials];
                        newSocials[i].name = e.target.value;
                        setFooter({...footer, socials: newSocials});
                      }} />
                    </div>
                    <div className="flex-1">
                      <Input label="Enlace a tu perfil (URL)" value={social.url} onChange={(e) => {
                        const newSocials = [...footer.socials];
                        newSocials[i].url = e.target.value;
                        setFooter({...footer, socials: newSocials});
                      }} />
                    </div>
                    <button 
                      onClick={() => setFooter({...footer, socials: footer.socials.filter((_, idx) => idx !== i)})}
                      className="p-3 text-accent hover:bg-accent/10 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </CMSSection>

      </div>
    </div>
  );
};

export default CMSManager;
