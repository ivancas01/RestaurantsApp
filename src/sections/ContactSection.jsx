import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Camera, Link, Send, User, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const WHATSAPP_NUMBER = "573024788683";

const ContactSection = () => {
  const { cmsData = {} } = useAdmin() || {};
  const { showNotification } = useNotification();
  const contact = cmsData?.contact || {
    address: "Calle 42 # 8s-12, Sector Industrial",
    phone: "+57 302 478 8683",
    email: "hola@luminagourmet.com",
    instagram: "@luminagourmet",
    whatsapp_prefix: "57"
  };

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    motivo: '',
    descripcion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!formData.nombre?.trim() || !formData.telefono?.trim() || !formData.motivo?.trim()) {
      showNotification("Por favor completa los campos requeridos (Nombre, Teléfono y Motivo).", "error");
      return;
    }

    const brandName = cmsData?.brand?.name || 'URBAN STREET';
    let message = `🛸 *MENSAJE DE CONTACTO - ${brandName}*\n\n`;
    message += `👤 *NOMBRE:* ${formData.nombre}\n`;
    message += `📞 *TELÉFONO:* ${formData.telefono}\n`;
    message += `📧 *CORREO:* ${formData.correo || 'No especificado'}\n`;
    message += `🎯 *MOTIVO:* ${formData.motivo}\n\n`;
    message += `📝 *DESCRIPCIÓN:*\n${formData.descripcion || 'Sin descripción adicional'}\n\n`;
    message += `---`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="contacto" className="py-20 md:py-32 bg-surface relative overflow-hidden border-t border-white/5">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
      
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 relative z-10">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <h2 className="mb-10 md:mb-12">
            Base de <br /><span className="text-primary italic">Operaciones</span>
          </h2>
          
          <div className="space-y-8 md:space-y-10">
            <div className="flex items-start space-x-5 md:space-x-6 group">
              <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                <Phone className="text-primary group-hover:text-text-bright" size={20} md:size={24} />
              </div>
              <div className="pt-1 md:pt-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1 font-bold">// HOTLINE</p>
                <p className="text-xl md:text-2xl font-serif text-text-bright uppercase">{contact.phone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-5 md:space-x-6 group border-t border-white/5 pt-8 md:pt-10">
              <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                <Mail className="text-primary group-hover:text-text-bright" size={20} md:size={24} />
              </div>
              <div className="pt-1 md:pt-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1 font-bold">// ENCRYPTED MAIL</p>
                <p className="text-xl md:text-2xl font-serif text-text-bright uppercase leading-tight break-all">{contact.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-5 md:space-x-6 group border-t border-white/5 pt-8 md:pt-10">
              <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                <MapPin className="text-primary group-hover:text-text-bright" size={20} md:size={24} />
              </div>
              <div className="pt-1 md:pt-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1 font-bold">// SECTOR 42</p>
                <p className="text-xl md:text-2xl font-serif text-text-bright uppercase leading-tight">{contact.address}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-6 md:space-x-8 mt-12 md:mt-16">
            {[Camera, Link, Send].map((Icon, i) => (
              <button key={i} className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/5 flex items-center justify-center text-text-dim/50 hover:text-primary hover:border-primary transition-all bg-background/50">
                <Icon size={18} md:size={20} />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background border-2 border-primary/20 p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          {/* Form Header */}
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-px bg-primary"></div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary whitespace-nowrap">Transmisión Directa</h3>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10"></div>
          </div>

          <form onSubmit={handleSendWhatsApp} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Input 
                  label="Nombre Completo" 
                  name="nombre"
                  placeholder="Ej. Marcus Vane"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Input 
                  label="Número de Enlace" 
                  name="telefono"
                  placeholder="+57 3XX..."
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Input 
                label="Email (Opcional)" 
                name="correo"
                type="email"
                placeholder="vane@urban.com"
                value={formData.correo}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <Input 
                label="Motivo de Contacto" 
                name="motivo"
                placeholder="Ej. Evento privado, Sugerencia..."
                value={formData.motivo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Descripción Rápida</label>
              <textarea 
                name="descripcion"
                placeholder="Escribe tu mensaje aquí..."
                value={formData.descripcion}
                onChange={handleInputChange}
                className="input-field min-h-[120px] py-4"
              />
            </div>

            <Button type="submit" className="w-full py-5 text-base md:text-lg flex items-center justify-center space-x-3 group">
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>ENVIAR MENSAJE VÍA WHATSAPP</span>
            </Button>
          </form>

          {/* Decorative detail */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
