import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, Send, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from './ui/Button';
import Input from './ui/Input';

const WHATSAPP_NUMBER = "573024788683";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, isCartOpen, total, toggleCart, updateQuantity, updateNotes, removeFromCart, clearCart } = useCart();
  const { cmsData, addOrder } = useAdmin();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    identificacion: '',
    direccion: ''
  });

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = (cmsData.contact.opening_time || "08:00:00").split(':').map(Number);
  const [closeH, closeM] = (cmsData.contact.closing_time || "22:00:00").split(':').map(Number);
  const openingTime = openH * 60 + (openM || 0);
  const closingTime = closeH * 60 + (closeM || 0);
  
  let isClosed = false;
  if (closingTime < openingTime) {
    isClosed = !(currentTime >= openingTime || currentTime <= closingTime);
  } else {
    isClosed = !(currentTime >= openingTime && currentTime <= closingTime);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatWhatsAppMessage = () => {
    const brand = cmsData?.brand || { name: 'URBAN STREET' };
    let message = `--- PEDIDO: ${brand.name} ---\n\n`;
    message += `. CLIENTE: ${formData.nombre}\n`;
    message += `. TELÉFONO: ${formData.telefono}\n`;
    message += `. IDENTIFICACIÓN: ${formData.identificacion}\n`;
    message += `. DIRECCIÓN: ${formData.direccion}\n\n`;
    message += `--- PRODUCTOS ---\n`;

    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${item.price})\n`;
      if (item.notes) {
        message += `  nota: ${item.notes}\n`;
      }
    });

    message += `\n. TOTAL: $${total.toFixed(2)}\n\n`;
    message += `--- Enviado desde ${brand.name} ---`;

    return encodeURIComponent(message);
  };

  const handleSendOrder = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.telefono.trim() || !formData.direccion.trim()) {
      showNotification("Por favor completa los campos obligatorios (Nombre, Teléfono y Dirección).", "error");
      return;
    }
    if (formData.telefono.replace(/\D/g, '').length < 7) {
      showNotification("Por favor ingresa un número de teléfono válido.", "error");
      return;
    }

    try {
      showNotification("Registrando pedido en el sistema...", "info");
      
      // 1. Wait for backend to confirm
      await addOrder({
        type: 'delivery',
        customer_name: formData.nombre,
        customer_phone: formData.telefono,
        customer_address: formData.direccion,
        identification: formData.identificacion,
        items: cartItems,
        total: total,
        status: 'Pendiente'
      });

      // 2. Only if successful, open WhatsApp
      const message = formatWhatsAppMessage();
      const businessPhone = (cmsData.contact.phone || WHATSAPP_NUMBER).replace(/\D/g, '');
      
      // On mobile, window.open is blocked by popup blockers because of the async `await addOrder` above.
      // So we redirect the current window for mobile devices, and open a new tab on desktop.
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://wa.me/${businessPhone}?text=${message}`;
      } else {
        window.open(`https://wa.me/${businessPhone}?text=${message}`, '_blank');
      }
      
      clearCart();
    } catch (err) {
      showNotification("No se pudo registrar el pedido en el sistema. Intenta de nuevo.", "error");
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-surface z-[70] shadow-2xl flex flex-col border-l border-white/5"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-background/50">
              <div className="flex items-center space-x-3">
                <div className="bg-primary p-2">
                  <ShoppingBag className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider text-text-bright leading-none">Tu Bolsa</h2>
                  <p className="text-[8px] uppercase tracking-widest text-text-dim mt-1 font-bold">Urban Street // Checkout</p>
                </div>
                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-none ml-2">
                  {cartCount}
                </span>
              </div>
              <button onClick={toggleCart} className="p-2 hover:bg-white/5 transition-colors text-text-dim hover:text-text-bright border border-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {isClosed ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                      <img 
                        src={cmsData.contact.closed_image || "https://images.unsplash.com/photo-1541480601022-2308c0f02487?q=80&w=800&auto=format&fit=crop"} 
                        alt="Cerrado" 
                        className="w-full h-full object-cover grayscale contrast-125"
                      />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-primary text-white p-3 rounded-full animate-bounce shadow-lg">
                       <span className="text-xl font-bold">Zzz</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-serif uppercase text-primary italic">Fuera de Servicio</h3>
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-text-dim max-w-[280px] leading-relaxed mx-auto">
                      Nuestra cocina está descansando en este momento. Por favor, realiza tu pedido durante nuestro horario de atención:
                    </p>
                    <div className="bg-primary/10 border border-primary/20 p-4 inline-block">
                       <p className="text-primary font-black text-xl tracking-[0.2em]">
                         {cmsData.contact.opening_time.substring(0, 5)} - {cmsData.contact.closing_time.substring(0, 5)}
                       </p>
                    </div>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <div className="p-8 border-2 border-dashed border-white/10">
                    <ShoppingBag size={64} strokeWidth={1} />
                  </div>
                  <p className="uppercase tracking-[0.2em] text-[10px] font-bold max-w-[200px]">Tu bolsa táctica está vacía en este momento</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toggleCart();
                      navigate('/menu');
                    }} 
                    className="text-xs"
                  >
                    EMPEZAR A AGREGAR
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="group border-b border-white/5 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 pr-4">
                            <h3 className="text-base md:text-lg font-serif uppercase text-text-bright leading-none mb-1">{item.name}</h3>
                            <p className="text-primary font-bold text-xs md:text-sm tracking-widest">{item.price}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-text-dim hover:text-primary transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-zinc-200 dark:border-white/10 bg-background">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors text-text-dim border-r border-white/5"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-12 text-center font-bold text-text-bright text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors text-text-dim border-l border-white/5"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="text-text-bright font-bold text-base">
                              ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-primary uppercase tracking-[0.2em] ml-1">Instrucciones Especiales</label>
                            <div className="relative">
                              <MessageSquare size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => updateNotes(item.id, e.target.value.toUpperCase())}
                                placeholder="SIN CEBOLLA, TÉRMINO MEDIO, ETC..."
                                className="w-full bg-background border border-zinc-200 dark:border-white/10 p-3 pl-9 text-[10px] md:text-[11px] uppercase tracking-widest text-text-bright focus:outline-none focus:border-primary transition-colors placeholder:text-text-dim/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Form */}
                  <div className="mt-8 space-y-6 pt-12 border-t-2 border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-primary animate-pulse"></div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Logística de Entrega</h3>
                    </div>

                    <form className="space-y-4">
                      <Input
                        label="Nombre de Contacto"
                        name="nombre"
                        placeholder="Quien recibe el pedido..."
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="WhatsApp de Enlace"
                        name="telefono"
                        placeholder="+57..."
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Identificación (ID / CC)"
                        name="identificacion"
                        placeholder="Para facturación interna..."
                        value={formData.identificacion}
                        onChange={handleInputChange}
                      />
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Dirección de Desembarco</label>
                        <textarea
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          className="input-field min-h-[100px] text-base md:text-[11px]"
                          placeholder="Calle, Número, Apto, Barrio..."
                        />
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && !isClosed && (
              <div className="p-6 md:p-8 border-t border-white/5 bg-background/90 backdrop-blur-md">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-text-dim font-bold">Total a Transferir</p>
                    <p className="text-[8px] text-primary font-bold uppercase tracking-tighter mt-1">Tarifa de envío según cobertura</p>
                  </div>
                  <p className="text-3xl md:text-4xl font-serif text-text-bright">${total.toFixed(2)}</p>
                </div>

                <Button
                  onClick={handleSendOrder}
                  className="w-full py-4 sm:py-5 text-sm sm:text-xl flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#128C7E] border-none shadow-[8px_8px_0px_0px_rgba(37,211,102,0.2)]"
                >
                  <MessageSquare size={18} />
                  <span>PEDIR POR WHATSAPP</span>
                </Button>

                <p className="text-center mt-4 text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-text-dim">
                  Urban Street // Secure Logistical Hub
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
