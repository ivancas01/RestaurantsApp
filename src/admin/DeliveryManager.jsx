import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Search, Trash2, Printer, MapPin, Phone, CheckCircle, XCircle, CreditCard, ShoppingBag, Eye, X, ChefHat, Clock, MessageSquare, Edit2, Plus, Wallet, ArrowRightLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useNotification } from '../context/NotificationContext';
import ConfirmModal from '../components/ui/ConfirmModal';

const DeliveryManager = () => {
  const { orders, updateOrderStatus, deleteOrder, updateOrder, cmsData, menu, addOrder, fetchOrders } = useAdmin();

  // Local Polling: Only while logistics is open
  useEffect(() => {
    fetchOrders(); // Initial fetch
    const POLL_INTERVAL = 8000;
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    }, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);
  const brand = cmsData?.brand || { name: 'URBAN STREET', tagline: 'Gourmet Command Center' };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const { showNotification } = useNotification();
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');

  // Edit State
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [activeMenuCat, setActiveMenuCat] = useState(menu[0]?.id || '');
  const [visibleCount, setVisibleCount] = useState(10);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setVisibleCount(prev => prev + 10);
    }
  };
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    identification: '',
    items: [],
    type: 'delivery',
    notes: ''
  });

  useEffect(() => {
    const lookupCustomer = async () => {
      if (newOrder.identification && newOrder.identification.length >= 4) {
        try {
          const results = await api.searchCustomer(newOrder.identification);
          const match = results.find(c => String(c.identification) === String(newOrder.identification));
          if (match) {
            setNewOrder(prev => ({
              ...prev,
              customer_name: match.name,
              customer_phone: match.phone,
              customer_address: match.address || prev.customer_address
            }));
          }
        } catch (err) {
          console.error("Autocomplete error:", err);
        }
      }
    };
    
    const timeoutId = setTimeout(lookupCustomer, 500);
    return () => clearTimeout(timeoutId);
  }, [newOrder.identification]);
  
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    const itemsHtml = (order.items || []).map(item => `
      <div class="item-row">
        <span class="item-name">${item.quantity}x ${(item.product_name || 'ITEM')}</span>
        <span class="item-price">$${(parseFloat(String(item.price_at_order).replace('$', '')) * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Ticket Web #${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { padding: 20px; color: black; background: white; width: 280px; margin: 0 auto; overflow-x: hidden; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0; line-height: 1; }
            .header p { font-family: 'Courier New', Courier, monospace; font-size: 10px; margin: 5px 0 0; letter-spacing: 2px; text-transform: uppercase; }
            .meta { font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; margin-bottom: 20px; }
            .meta div { display: flex; justify-content: space-between; margin-bottom: 4px; gap: 10px; }
            .meta div span:first-child { flex-shrink: 0; }
            .meta div span:last-child { text-align: right; word-break: break-all; }
            .items { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px; font-family: 'Courier New', Courier, monospace; gap: 10px; }
            .item-name { flex: 1; text-align: left; text-transform: uppercase; }
            .item-price { flex-shrink: 0; text-align: right; }
            .total { font-family: 'Courier New', Courier, monospace; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid black; padding-top: 8px; }
            .footer { font-family: 'Courier New', Courier, monospace; text-align: center; margin-top: 30px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; line-height: 1.4; }
            @media print { 
              body { padding: 5px; width: 260px; margin: 0; } 
              .no-print { display: none; } 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${brand.name}</h1>
            <p>${brand.tagline} // Web</p>
          </div>
          <div class="meta">
            <div><span>ID:</span> <span>#${String(order.id).split('_').pop()}</span></div>
            <div><span>Fecha:</span> <span>${new Date().toLocaleDateString()}</span></div>
            <div><span>Cliente:</span> <span>${order.customer_name}</span></div>
            <div><span>Dir:</span> <span>${order.customer_address}</span></div>
            <div><span>Tel:</span> <span>${order.customer_phone || order.phone}</span></div>
            ${order.waiter_name ? `<div><span>Atendido por:</span> <span>${order.waiter_name.toUpperCase()}</span></div>` : ''}
          </div>
          <div class="items">${itemsHtml}</div>
          <div class="total">
            <span>TOTAL PAGADO</span>
            <span>${order.total}</span>
          </div>
          <div class="footer">¡Gracias por pedir! // Urban Street</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadPDF = (order) => {
    const itemsHtml = (order.items || []).map(item => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-family: 'Courier New', Courier, monospace; font-size: 12px;">
          <span style="text-transform: uppercase;">${item.quantity}x ${(item.product_name || item.name || 'ITEM')}</span>
          <span>$${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
        </div>
        ${item.notes ? `<div style="font-size: 10px; color: #666; font-style: italic; margin-left: 20px;">-- ${item.notes}</div>` : ''}
      </div>
    `).join('');

    const content = `
      <div style="padding: 40px; font-family: 'Courier New', Courier, monospace; color: black; background: white; max-width: 500px; margin: auto;">
        <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 28px;">${brand.name}</h1>
          <p style="margin: 5px 0 0; text-transform: uppercase; font-size: 10px; letter-spacing: 2px;">${brand.tagline} // WEB</p>
        </div>
        <div style="margin-bottom: 25px; font-size: 12px; text-transform: uppercase; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between;"><span>FACTURA:</span> <span>#WEB_${String(order.id).split('_').pop()}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>FECHA:</span> <span>${new Date().toLocaleDateString()}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>CLIENTE:</span> <span>${order.customer_name}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>DIR:</span> <span>${order.customer_address}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>TEL:</span> <span>${order.customer_phone || order.phone}</span></div>
        </div>
        <div style="border-bottom: 1px solid #000; padding-bottom: 15px; margin-bottom: 15px;">
           <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px; font-size: 12px;">
             <span>DESCRIPCIÓN</span>
             <span>TOTAL</span>
           </div>
           ${itemsHtml}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 2px solid black; padding-top: 10px;">
          <span>TOTAL PAGADO</span>
          <span>${order.total}</span>
        </div>
        <div style="text-align: center; margin-top: 40px; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
           ¡Gracias por visitarnos! // Urban Street
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `${(order.customer_name || 'WEB').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(content).set(opt).save();
    showNotification("Factura descargada exitosamente", "success");
  };

  const calculateTotal = (items) => items.reduce((acc, i) => acc + (parseFloat(String(i.price_at_order || i.price || '0').replace('$', '')) * i.quantity), 0);

  const addToCart = (product) => {
    const existingIndex = newOrder.items.findIndex(i => {
      const itemId = i.id || i.product || i.product_id;
      return String(itemId) === String(product.id) || (i.product_name === product.name || i.name === product.name);
    });
    
    if (existingIndex > -1) {
      const updatedItems = [...newOrder.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
      setNewOrder({ ...newOrder, items: updatedItems });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { ...product, product_id: product.id, product_name: product.name, quantity: 1, price_at_order: product.price }]
      });
    }
  };

  const removeFromCart = (targetId) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(i => {
        const itemId = i.id || i.product || i.product_id;
        return String(itemId) !== String(targetId);
      })
    });
  };

  const updateQty = (targetId, delta) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map(i => {
        const itemId = i.id || i.product || i.product_id;
        if (String(itemId) === String(targetId)) {
          return { ...i, quantity: Math.max(1, i.quantity + delta) };
        }
        return i;
      })
    });
  };

  const updateItemNote = (targetId, note) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map(i => {
        const itemId = i.id || i.product || i.product_id;
        if (String(itemId) === String(targetId)) {
          return { ...i, notes: note };
        }
        return i;
      })
    });
  };

  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setNewOrder({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone || order.phone || '',
      customer_address: order.customer_address || '',
      identification: order.identification || '',
      items: [...(order.items || [])],
      type: 'delivery',
      notes: order.notes || ''
    });
    setIsAddingOrder(true);
  };

  const handleSaveOrder = () => {
    if (!newOrder.customer_name.trim()) {
      showNotification("El nombre del cliente es obligatorio", "error");
      return;
    }
    if (newOrder.items.length === 0) {
      showNotification("Debes agregar al menos un producto", "error");
      return;
    }
    
    const updatedData = {
      ...newOrder,
      total: calculateTotal(newOrder.items).toFixed(2).startsWith('$') ? calculateTotal(newOrder.items).toFixed(2) : `$${calculateTotal(newOrder.items).toFixed(2)}`
    };

    if (editingOrderId) {
      updateOrder(editingOrderId, updatedData);
      setEditingOrderId(null);
      showNotification("Pedido de domicilio actualizado");
    } else {
      addOrder({
        ...updatedData,
        type: 'delivery',
        status: 'Pendiente',
        created_at: new Date().toISOString()
      });
      showNotification("Nuevo domicilio registrado");
    }
    
    setIsAddingOrder(false);
    setNewOrder({
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      identification: '',
      items: [],
      type: 'delivery',
      notes: ''
    });
  };

  const handleFinalizePayment = async () => {
    if (!paymentModalOrder) return;
    await updateOrder(paymentModalOrder.id, { 
      isPaid: true, 
      payment_method: selectedPaymentMethod 
    });
    setPaymentModalOrder(null);
    showNotification(`Domicilio #${paymentModalOrder.id} marcado como PAGADO (${selectedPaymentMethod})`);
  };
  
  // Filter only delivery orders
  const deliveryOrders = orders.filter(o => o.type === 'delivery');
  
  const filteredOrders = deliveryOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return (o.customer_name || '').toLowerCase().includes(searchLower) || 
           (o.customer_address || '').toLowerCase().includes(searchLower) ||
           String(o.id || '').toLowerCase().includes(searchLower);
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleDelete = (id) => {
    setOrderToDelete(id);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setSelectedOrderId(null);
      setOrderToDelete(null);
      showNotification('Registro eliminado');
    }
  };

  const getStatusColor = (order) => {
    if (order.isPaid && order.isSent) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (order.isPaid) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (order.isSent) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  };

  return (
    <div className="space-y-10 relative uppercase">
      {/* Payment Selection Modal */}
      <Modal
        isOpen={!!paymentModalOrder}
        onClose={() => setPaymentModalOrder(null)}
        title="Cobro Domicilio"
        subtitle={`Pedido #${paymentModalOrder?.id}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-8 p-4">
           <div className="text-center space-y-2">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Total a Recaudar</p>
              <h3 className="text-5xl font-serif text-primary">{paymentModalOrder?.total}</h3>
           </div>
           
           <div className="space-y-4">
              <p className="text-[10px] font-bold text-text-bright uppercase tracking-[0.2em] border-b border-zinc-800 pb-2">Método de Pago Recibido</p>
              <div className="grid grid-cols-1 gap-3">
                 {[
                   { id: 'Cash', label: 'Efectivo', icon: <Wallet size={18} /> },
                   { id: 'Card', label: 'Tarjeta / Datafono', icon: <CreditCard size={18} /> },
                   { id: 'Transfer', label: 'Nequi / Transferencia', icon: <ArrowRightLeft size={18} /> }
                 ].map(m => (
                   <button 
                     key={m.id}
                     onClick={() => setSelectedPaymentMethod(m.id)}
                     className={`flex items-center justify-between p-5 border-2 transition-all ${selectedPaymentMethod === m.id ? 'border-primary bg-primary/10' : 'border-zinc-800 hover:border-zinc-600'}`}
                   >
                      <div className="flex items-center space-x-4">
                         <div className={selectedPaymentMethod === m.id ? 'text-primary' : 'text-text-dim'}>{m.icon}</div>
                         <span className={`text-xs font-bold uppercase tracking-widest ${selectedPaymentMethod === m.id ? 'text-text-bright' : 'text-text-dim'}`}>{m.label}</span>
                      </div>
                      {selectedPaymentMethod === m.id && <CheckCircle className="text-primary" size={18} />}
                   </button>
                 ))}
              </div>
           </div>

           <Button onClick={handleFinalizePayment} className="w-full py-5 text-lg shadow-[10px_10px_0px_0px_rgba(225,29,72,0.2)]">
              Marcar como Pagado
           </Button>
        </div>
      </Modal>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-l-8 border-primary pl-6 md:pl-8 mb-10">
        <div>
          <h1 className="text-4xl md:text-7xl font-serif uppercase leading-none text-text-bright">Logística <span className="text-primary italic">Web</span></h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">Rastreo de Pedidos WhatsApp</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full lg:w-auto">
           <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-4 flex flex-col items-center md:items-start min-w-[200px]">
              <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Entregas Activas</span>
              <span className="text-2xl font-serif text-text-bright">{deliveryOrders.filter(o => !o.isPaid).length}</span>
           </div>
           <Button onClick={() => {setIsAddingOrder(true); setEditingOrderId(null);}} className="w-full flex items-center justify-center space-x-2 py-5 lg:py-4 shadow-[8px_8px_0px_0px_rgba(225,29,72,0.1)]">
              <Plus size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Nuevo Domicilio</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
         {/* Left Side: Delivery List (2/3) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-4">
               <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
                  <input 
                     type="text" 
                     placeholder="FILTRAR POR CLIENTE, DIRECCIÓN O ID..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-background border-2 border-zinc-200 dark:border-zinc-800 p-2 pl-9 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                  />
               </div>
            </div>

            <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-xl">
               <div className="overflow-x-auto scrollbar-hide max-h-[70vh]" onScroll={handleScroll}>
                  <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-800 uppercase tracking-widest text-[9px] font-bold text-primary">
                           <th className="p-4">Cliente / Contacto</th>
                           <th className="p-4">Ruta de Desembarco</th>
                           <th className="p-4">Cocina</th>
                           <th className="p-4">Logística</th>
                           <th className="p-4">Pago</th>
                           <th className="p-4 text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="text-[11px] font-bold uppercase">
                        {filteredOrders.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="p-20 text-center opacity-30">
                                 <ShoppingBag size={40} className="mx-auto mb-4" strokeWidth={0.5} />
                                 <p className="text-[9px] tracking-[0.2em]">Sin registros web</p>
                              </td>
                           </tr>
                        ) : (
                           filteredOrders.map((order, idx) => {
                              const isSelected = selectedOrderId === order.id;
                              const isKitchenReady = order.status === 'Listo';
                              const isKitchenInProcess = ['En Lista', 'Preparando', 'Confirmado'].includes(order.status);
                              
                              return (
                                 <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className={`border-b border-zinc-100 dark:border-zinc-900 cursor-pointer transition-all hover:bg-primary/5 ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                 >
                                    <td className="p-4">
                                       <div className="space-y-1">
                                          <div className="flex items-center space-x-2">
                                              <p className="text-sm font-serif text-text-bright"><span className="text-primary/50 mr-2 font-bold italic">#{idx + 1}</span>{order.customer_name || <span className="text-accent opacity-50 italic">Sin Nombre</span>}</p>
                                              <span className={`text-[7px] px-1.5 py-0.5 font-black uppercase tracking-widest border ${getStatusColor(order)}`}>
                                                {order.status || 'WEB'}
                                              </span>
                                           </div>
                                           <p className="text-[9px] text-text-dim font-mono">REF: #{String(order.id).split('_').pop()}</p>
                                          <a 
                                            href={`https://wa.me/${(order.customer_phone || order.phone || '').replace(/\D/g, '').length > 10 ? (order.customer_phone || order.phone || '').replace(/\D/g, '') : '57' + (order.customer_phone || order.phone || '').replace(/\D/g, '')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[8px] text-text-dim tracking-widest hover:text-primary transition-all flex items-center space-x-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Phone size={8} className="text-primary/50" />
                                            <span>{order.customer_phone || order.phone || <span className="text-accent opacity-50 italic">Sin Contacto</span>}</span>
                                          </a>
                                          {order.waiter_name && (
                                            <div className="pt-1 flex items-center space-x-1">
                                               <span className="text-[7px] font-bold text-primary uppercase tracking-tighter italic">Admin: {order.waiter_name}</span>
                                            </div>
                                          )}
                                       </div>
                                    </td>
                                    <td className="p-4 truncate max-w-[250px] text-text-dim lowercase font-normal italic">
                                       {order.customer_address || <span className="text-accent opacity-50 italic">Sin Dirección Registrada</span>}
                                    </td>
                                    <td className="p-4">
                                       {isKitchenReady ? (
                                          <span className="flex items-center space-x-1 text-green-500 font-bold text-[8px] animate-pulse">
                                             <CheckCircle size={10} />
                                             <span>LISTO ENVÍO</span>
                                          </span>
                                       ) : isKitchenInProcess ? (
                                          <span className="text-primary text-[8px] tracking-widest italic">{order.status === 'En Lista' ? 'En Lista' : 'En Preparación'}</span>
                                       ) : (
                                          <span className="text-text-dim/40 text-[8px] tracking-widest">No Enviado</span>
                                       )}
                                    </td>
                                    <td className="p-4">
                                       {order.isSent ? (
                                          <span className="flex items-center space-x-1 text-blue-500 bg-blue-500/10 px-2 py-0.5 border border-blue-500/20 text-[8px]">
                                             <CheckCircle size={10} />
                                             <span>Enviado</span>
                                          </span>
                                       ) : (
                                          <span className="text-text-dim/40 text-[8px] tracking-widest">Pendiente</span>
                                       )}
                                    </td>
                                    <td className="p-4">
                                       {order.isPaid ? (
                                          <span className="flex items-center space-x-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[8px]">
                                             <CheckCircle size={10} />
                                             <span>{order.payment_method || 'Pagado'}</span>
                                          </span>
                                       ) : (
                                          <span className="text-text-dim/40 text-[8px] tracking-widest">Pendiente</span>
                                       )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                       <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="p-2 text-accent hover:bg-accent/10 transition-all"><Trash2 size={14}/></button>
                                       <button onClick={(e) => { e.stopPropagation(); handleEditClick(order); }} className="p-2 text-primary hover:bg-primary/10 transition-all"><Edit2 size={14}/></button>
                                       <button className="p-2 text-text-dim hover:bg-white/5 transition-all"><Eye size={14}/></button>
                                    </td>
                                 </tr>
                              );
                           })
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Right Side: Delivery Detail (1/3) */}
         <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
               {selectedOrder ? (
                  <motion.div 
                     key={selectedOrder.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 sticky top-10 flex flex-col shadow-2xl"
                  >
                     <div className="p-6 bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-900 flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-primary tracking-widest">// EXPEDIENTE WEB</p>
                           <h2 className="text-2xl font-serif text-text-bright uppercase">{selectedOrder.customer_name}</h2>
                           <p className="text-[10px] text-text-dim font-bold tracking-tighter">ID: {selectedOrder.id}</p>
                           {selectedOrder.waiter_name && (
                               <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1 italic">// Admin: {selectedOrder.waiter_name}</p>
                            )}
                        </div>
                        <button onClick={() => setSelectedOrderId(null)} className="p-1 text-text-dim hover:text-primary"><X size={20}/></button>
                     </div>

                     <div className="p-6 space-y-6">
                        <div className="space-y-4">
                           <div className="flex items-start space-x-3">
                              <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Dirección de Entrega</p>
                                 <p className="text-xs font-bold text-text-bright uppercase leading-relaxed">{selectedOrder.customer_address}</p>
                              </div>
                           </div>
                           <div className="flex items-start space-x-3">
                              <Phone size={16} className="text-primary flex-shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Canal de Enlace</p>
                                 <a 
                                    href={`https://wa.me/${(selectedOrder.customer_phone || selectedOrder.phone || '').replace(/\D/g, '').length > 10 ? (selectedOrder.customer_phone || selectedOrder.phone || '').replace(/\D/g, '') : '57' + (selectedOrder.customer_phone || selectedOrder.phone || '').replace(/\D/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs font-bold text-text-bright hover:text-primary hover:underline transition-all flex items-center space-x-2"
                                  >
                                    <span>{selectedOrder.customer_phone || selectedOrder.phone}</span>
                                  </a>
                              </div>
                           </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4">
                           <p className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase mb-4">Ítems Solicitados</p>
                           <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                               { (selectedOrder.items || []).map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-[10px] font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2 last:border-0">
                                     <span>{item.quantity}x {item.product_name}</span>
                                     <span className="text-text-dim">${(parseFloat(String(item.price_at_order).replace('$', '')) * item.quantity).toFixed(2)}</span>
                                  </div>
                               ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center text-xl font-serif text-text-bright border-t-2 border-primary pt-2">
                               <span>TOTAL</span>
                               <span className="text-primary">{selectedOrder.total}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                           <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest text-center mb-2">Flujo de Producción</p>
                           
                           <div className="flex space-x-2">
                               <Button variant="outline" onClick={() => handleEditClick(selectedOrder)} className="flex-1 text-[9px] border-zinc-700 py-3"><Edit2 size={14}/><span>Editar Datos</span></Button>
                               <Button 
                                  onClick={() => updateOrderStatus(selectedOrder.id, 'En Lista')}
                                  disabled={['En Lista', 'Preparando', 'Listo', 'Confirmado'].includes(selectedOrder.status)}
                                  className={`flex-1 py-3 text-[10px] space-x-2 border-2 ${['En Lista', 'Preparando', 'Listo', 'Confirmado'].includes(selectedOrder.status) ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700' : 'bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(225,29,72,0.2)]'}`}
                                >
                                   {selectedOrder.status === 'Listo' ? (
                                      <><CheckCircle size={14}/></>
                                   ) : ['En Lista', 'Preparando', 'Confirmado'].includes(selectedOrder.status) ? (
                                      <><Clock size={14}/></>
                                   ) : (
                                      <><ChefHat size={14}/><span>Cocina</span></>
                                   )}
                               </Button>
                            </div>

                           <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest text-center mt-6 mb-2">Acciones de Logística</p>
                           <div className="grid grid-cols-2 gap-2">
                              <Button 
                                 onClick={() => updateOrder(selectedOrder.id, { isSent: true })}
                                 disabled={selectedOrder.isSent}
                                 className={`text-[9px] space-x-2 ${selectedOrder.isSent ? 'bg-zinc-500 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                              >
                                 {selectedOrder.isSent ? <CheckCircle size={14}/> : <Truck size={14}/>}
                                 <span>{selectedOrder.isSent ? 'Enviado' : 'Marcar Enviado'}</span>
                              </Button>
                              <Button 
                                  onClick={() => setPaymentModalOrder(selectedOrder)}
                                  disabled={selectedOrder.isPaid}
                                  className={`text-[9px] space-x-2 ${selectedOrder.isPaid ? 'bg-zinc-500 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                               >
                                  {selectedOrder.isPaid ? <CheckCircle size={14}/> : <CreditCard size={14}/>}
                                  <span>{selectedOrder.isPaid ? 'Pagado' : 'Marcar Pagado'}</span>
                               </Button>
                           </div>

                           {/* View Invoice - Only if Sent AND Paid */}
                           {selectedOrder.isSent && selectedOrder.isPaid && (
                               <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="pt-4"
                               >
                                  <button 
                                     onClick={() => setShowInvoice(true)}
                                     className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all border-2 border-zinc-700"
                                  >
                                     <Printer size={16} />
                                     <span>Ver y Descargar Factura</span>
                                  </button>
                               </motion.div>
                           )}
                           {!selectedOrder.isSent && !selectedOrder.isPaid && ['Pendiente', 'En Lista', 'Confirmado'].includes(selectedOrder.status || 'Pendiente') ? (
                              <button 
                                  onClick={() => handleDelete(selectedOrder.id)}
                                  className="w-full py-3 border-2 border-accent text-accent text-[9px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center space-x-2"
                               >
                                  <Trash2 size={14}/><span>Borrar Registro</span>
                              </button>
                           ) : (
                              <div className="w-full py-3 text-[8px] font-black text-text-dim/40 uppercase tracking-[0.2em] text-center border border-dashed border-zinc-800">
                                Registro Bloqueado: En Proceso / Finalizado
                              </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <div className="h-full border-2 border-dashed border-zinc-200 dark:border-zinc-900 flex flex-col items-center justify-center text-center p-10 opacity-30">
                     <ShoppingBag size={60} strokeWidth={0.5} className="mb-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Selecciona un registro web para gestionar</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && selectedOrder && (
          <div className="fixed inset-0 w-screen h-screen z-[1100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="bg-white text-zinc-900 w-[95%] max-w-sm p-6 md:p-8 font-mono relative shadow-2xl print-ticket overflow-hidden"
            >
               <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6 font-bold">
                 <h2 className="text-xl">{brand.name}</h2>
                 <p className="text-[10px] tracking-widest uppercase">{brand.tagline} // Web</p>
               </div>
               
               <div className="space-y-1 mb-8 text-[10px] uppercase">
                  <div className="flex justify-between"><span>FACTURA:</span><span className="font-bold">#WEB_{String(selectedOrder.id).split('_').pop()}</span></div>
                  <div className="flex justify-between"><span>ID REGISTRO:</span><span className="font-bold text-[8px]">{selectedOrder.id}</span></div>
                  <div className="flex justify-between"><span>FECHA:</span><span>{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>CLIENTE:</span><span className="font-bold">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span>DOCUMENTO:</span><span className="font-bold">{selectedOrder.identification || '---'}</span></div>
                  <div className="flex justify-between"><span>DIRECCIÓN:</span><span className="font-bold truncate max-w-[150px]">{selectedOrder.customer_address}</span></div>
               </div>

               <div className="border-b border-zinc-200 mb-6 pb-4">
                  <div className="flex justify-between text-[10px] font-bold mb-4"><span>DESC</span><span>TOTAL</span></div>
                  <div className="space-y-2">
                     {(selectedOrder.items || []).map((item, i) => (
                       <div key={i} className="flex flex-col text-[10px]">
                         <div className="flex justify-between">
                           <span className="max-w-[70%]">{item.quantity}x {(item.product_name || item.name || 'ITEM').toUpperCase()}</span>
                           <span>${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
                         </div>
                         {item.notes && <span className="text-[8px] text-zinc-500 italic ml-4">-- {item.notes}</span>}
                       </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-between text-lg font-bold border-t-2 border-zinc-900 pt-2 mb-10">
                  <span>TOTAL:</span>
                  <span>{selectedOrder.total}</span>
               </div>

               <div className="flex flex-col space-y-3 no-print">
                  <div className="grid grid-cols-2 gap-2">
                     <Button onClick={() => handlePrint(selectedOrder)} className="text-[10px] space-x-2">
                        <Printer size={14} />
                        <span>IMPRIMIR</span>
                     </Button>
                     <Button onClick={() => handleDownloadPDF(selectedOrder)} variant="outline" className="text-[10px] border-zinc-900 text-zinc-900 space-x-2">
                        <Truck size={14} />
                        <span>DESCARGAR</span>
                     </Button>
                  </div>
                  <Button variant="outline" onClick={() => setShowInvoice(false)} className="w-full text-[10px] border-zinc-300 text-zinc-400">Cerrar</Button>
               </div>
               
               <p className="text-center mt-8 text-[8px] opacity-40 uppercase tracking-[0.3em]">Urban Street // Digital Receipt</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <Modal 
        isOpen={isAddingOrder || !!editingOrderId} 
        onClose={() => {setIsAddingOrder(false); setEditingOrderId(null);}}
        title={editingOrderId ? 'Editar' : 'Nuevo'}
        subtitle="Domicilio"
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row h-full">
            <div className="w-full lg:w-2/3 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-900 pr-0 lg:pr-8 space-y-8 md:space-y-10 pb-10 lg:pb-0">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">01 Datos de Entrega</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <input type="text" placeholder="NOMBRE CLIENTE" value={newOrder.customer_name} onChange={e => setNewOrder({...newOrder, customer_name: e.target.value.toUpperCase()})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full" />
                      <input type="text" placeholder="IDENTIFICACIÓN / ID" value={newOrder.identification} onChange={e => setNewOrder({...newOrder, identification: e.target.value})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full" />
                      <input type="text" placeholder="TELÉFONO" value={newOrder.customer_phone} onChange={e => setNewOrder({...newOrder, customer_phone: e.target.value})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full" />
                      <input type="text" placeholder="DIRECCIÓN DE DESEMBARCO" value={newOrder.customer_address} onChange={e => setNewOrder({...newOrder, customer_address: e.target.value.toUpperCase()})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full sm:col-span-2" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">02 Seleccionar Menú</span></div>
                  <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-hide">
                      {menu.map(cat => (
                        <button key={cat.id} onClick={() => setActiveMenuCat(cat.id)} className={`px-4 py-2 text-[10px] font-bold border-2 transition-all whitespace-nowrap ${activeMenuCat === cat.id ? 'bg-primary border-primary text-white' : 'border-zinc-800 text-text-dim hover:border-primary'}`}>{cat.name.split('//')[0]}</button>
                      ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-h-[40vh] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar">
                      {(menu.find(c => c.id === activeMenuCat)?.products || []).filter(item => item.is_available !== false).map(item => (
                        <button key={item.id} onClick={() => addToCart(item)} className="flex justify-between items-center p-4 border-2 border-zinc-900 hover:border-primary bg-black/5 text-left font-bold uppercase text-[10px] transition-colors group"><div><p className="group-hover:text-primary transition-colors">{item.name}</p><p className="text-primary mt-1 font-mono">${item.price}</p></div><Plus size={16} className="text-primary" /></button>
                      ))}
                  </div>
                </div>
            </div>
            <div className="w-full lg:w-1/3 pl-0 lg:pl-8 flex flex-col h-full mt-8 lg:mt-0 pt-8 lg:pt-0">
                <div className="flex items-center space-x-3 mb-6"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">03 Resumen Pedido</span></div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar max-h-[30vh] lg:max-h-none">
                  {newOrder.items.length === 0 ? (
                    <div className="h-32 flex flex-center flex-col items-center justify-center border-2 border-dashed border-zinc-800 text-text-dim opacity-40"><ShoppingBag size={24} className="mb-2"/><p className="text-[8px] font-bold uppercase tracking-[0.2em]">Sin productos</p></div>
                  ) : (
                    newOrder.items.map(item => {
                      const itemId = item.id || item.product || item.product_id;
                      return (
                        <div key={itemId} className="flex flex-col border-b border-zinc-800 pb-4">
                            <div className="flex justify-between items-start font-bold text-[10px] text-text-bright pr-4"><span>{item.product_name || item.name}</span><button onClick={() => removeFromCart(itemId)} className="text-accent opacity-50 hover:opacity-100"><Trash2 size={14}/></button></div>
                            <div className="flex justify-between items-center mt-3 mb-3">
                              <div className="flex items-center space-x-3 bg-background border border-zinc-800 px-2 py-1"><button onClick={() => updateQty(itemId, -1)} className="text-primary font-bold px-2 hover:bg-primary/10 transition-colors">-</button><span className="font-mono text-xs">{item.quantity}</span><button onClick={() => updateQty(itemId, 1)} className="text-primary font-bold px-2 hover:bg-primary/10 transition-colors">+</button></div>
                              <span className="text-xs font-mono font-bold text-text-bright">${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
                            </div>
                            <input 
                              type="text" 
                              value={item.notes || ''} 
                              onChange={(e) => updateItemNote(itemId, e.target.value.toUpperCase())}
                              placeholder="NOTAS POR PRODUCTO..."
                              className="w-full bg-background border border-zinc-800 p-2 text-[8px] font-bold outline-none focus:border-primary uppercase"
                            />
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t-4 border-primary pt-6 space-y-6">
                  <div className="flex justify-between items-center text-text-bright"><span className="text-[10px] font-bold uppercase tracking-widest">Total Domicilio</span><span className="text-2xl md:text-3xl font-serif text-primary tracking-tighter">${calculateTotal(newOrder.items).toFixed(2)}</span></div>
                  <Button onClick={handleSaveOrder} className="w-full text-xs font-bold uppercase tracking-[0.2em] py-5 md:py-4 shadow-[8px_8px_0px_0px_rgba(225,29,72,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all" disabled={newOrder.items.length === 0 || !newOrder.customer_name}>{editingOrderId ? 'Guardar Cambios' : 'Registrar Domicilio'}</Button>
                </div>
            </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={confirmDeleteOrder}
        title="Eliminar Domicilio"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default DeliveryManager;
