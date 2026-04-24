import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Users, CheckCircle, XCircle, ChevronRight, Hash, Phone, Plus, Search, X, Trash2, Printer, CreditCard, ChefHat, Filter, MessageSquare, ShoppingBag, MapPin, Eye, Edit2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const OrdersManager = () => {
  const { orders, updateOrderStatus, updateOrder, tables, reservations, menu, addOrder, locations, updateReservationStatus, cmsData } = useAdmin();
  const brand = cmsData?.brand || { name: 'URBAN STREET', tagline: 'Gourmet Command Center' };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const { showNotification } = useNotification();
  
  // Sidebar State
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('ALL'); // ALL, Pendiente, Preparando, Completado, Pagado

  const tableOrders = orders.filter(o => o.type === 'table');
  
  // Safely filtered list for Sidebar
  const filteredSidebarOrders = tableOrders.filter(o => {
    // 1. Status Filter
    if (sidebarFilter !== 'ALL' && o.status !== sidebarFilter) return false;

    // 2. Search Filter (Null-safe)
    if (sidebarSearch.trim() === '') return true;
    const searchLower = sidebarSearch.toLowerCase();
    
    const customerName = (o.customer_name || '').toLowerCase();
    const orderId = (o.id || '').toLowerCase();
    const tableNum = tables.find(t => t.id === o.table)?.number?.toString() || '';

    return customerName.includes(searchLower) || 
           orderId.includes(searchLower) ||
           tableNum.includes(searchLower);
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    identification: '',
    items: [],
    type: 'table',
    table: '',
    reservationId: '',
    notes: ''
  });

  useEffect(() => {
    const tableIdFromUrl = searchParams.get('tableId');
    if (tableIdFromUrl && tables.length > 0) {
      const tableExists = tables.find(t => t.id === tableIdFromUrl);
      if (tableExists) {
        const timer = setTimeout(() => {
          setNewOrder(prev => ({ ...prev, table: tableIdFromUrl }));
          setIsAddingOrder(true);
          showNotification(`Mesa ${tableExists.number} seleccionada vía QR`, 'info');
          // Clear params from URL
          navigate('/hidden-admin/orders', { replace: true });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, tables, navigate]);

  const [resSearch, setResSearch] = useState('');
  const [activeMenuCat, setActiveMenuCat] = useState(menu[0]?.id || '');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRes = resSearch.trim() ? reservations.filter(r => {
    const isToday = r.date === todayStr;
    const matchesSearch = (r.name || '').toLowerCase().includes(resSearch.toLowerCase()) || 
                          (r.identification || '').includes(resSearch);
    return isToday && matchesSearch;
  }).slice(0, 5) : [];

  const handleLinkRes = (res) => {
    setNewOrder({
      ...newOrder,
      customer_name: res.name,
      customer_phone: res.phone,
      identification: res.identification,
      reservationId: res.id
    });
    // Mark reservation as completed automatically
    updateReservationStatus(res.id, 'Completada');
    setResSearch('');
    showNotification(`Reserva de ${res.name} vinculada y completada`, 'success');
  };

  const addToCart = (product) => {
    const existing = newOrder.items.find(i => i.id === product.id);
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { ...product, quantity: 1 }]
      });
    }
  };

  const removeFromCart = (id) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(i => i.id !== id)
    });
  };

  const updateQty = (id, delta) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map(i => {
        if (i.id === id) {
          return { ...i, quantity: Math.max(1, i.quantity + delta) };
        }
        return i;
      })
    });
  };

  const calculateTotal = (items) => items.reduce((acc, i) => acc + (parseFloat(String(i.price_at_order || i.price || '0').replace('$', '')) * i.quantity), 0);

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    const itemsHtml = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; font-family: 'Courier New', Courier, monospace;">
        <span>${item.quantity}x ${(item.product_name || item.name).toUpperCase()}</span>
        <span>$${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Ticket #${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
          <style>
            body { padding: 30px; color: black; background: white; width: 300px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
            .header h1 { font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 0; line-height: 1; }
            .header p { font-family: 'Courier New', Courier, monospace; font-size: 10px; margin: 5px 0 0; letter-spacing: 2px; text-transform: uppercase; }
            .meta { font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; margin-bottom: 20px; }
            .meta div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .items { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
            .total { font-family: 'Courier New', Courier, monospace; display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 2px solid black; padding-top: 8px; }
            .footer { font-family: 'Courier New', Courier, monospace; text-align: center; margin-top: 40px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; }
            @media print { body { padding: 10px; width: 100%; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${brand.name}</h1>
            <p>${brand.tagline}</p>
          </div>
          <div class="meta">
            <div><span>ID:</span> <span>#${String(order.id).split('_').pop()}</span></div>
            <div><span>Fecha:</span> <span>${new Date().toLocaleDateString()}</span></div>
            <div><span>Hora:</span> <span>${new Date().toLocaleTimeString()}</span></div>
            <div><span>Cliente:</span> <span>${order.customer_name}</span></div>
            ${order.table ? `<div><span>Mesa:</span> <span>${tables.find(t => t.id === order.table)?.number || 'N/A'}</span></div>` : ''}
          </div>
          <div class="items">${itemsHtml}</div>
          <div class="total">
            <span>TOTAL</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
          <div class="footer">¡Gracias por visitarnos! // Urban Street</div>
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

  const handleSaveOrder = () => {
    if (!newOrder.customer_name || newOrder.items.length === 0) return;
    
    if (editingOrderId) {
      const updatedData = {
        ...newOrder,
        total: calculateTotal(newOrder.items)
      };
      updateOrder(editingOrderId, updatedData);
      setEditingOrderId(null);
    } else {
      const finalOrder = {
        ...newOrder,
        total: calculateTotal(newOrder.items),
        status: 'Pendiente',
        timestamp: new Date().toISOString()
      };
      addOrder(finalOrder);
      setLastSavedOrder(finalOrder);
      showNotification("Pedido procesado exitosamente");
    }
    
    setIsAddingOrder(false);
    setNewOrder({
      customer_name: '',
      customer_phone: '',
      identification: '',
      items: [],
      type: 'table',
      table: '',
      reservationId: '',
      notes: ''
    });
  };

  const handleEditClick = (order) => {
    setEditingOrderId(order.id);
    setNewOrder({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone || '',
      identification: order.identification || '',
      items: [...order.items],
      type: order.type,
      table: order.table || '',
      reservationId: order.reservationId || '',
      notes: order.notes || ''
    });
    setIsAddingOrder(true);
  };

  const handleCancelConfirm = () => {
    if (orderToCancel && cancelReason) {
      updateOrderStatus(orderToCancel.id, 'Cancelado', cancelReason);
      setOrderToCancel(null);
      setCancelReason('');
      showNotification("Pedido cancelado correctamente", "warning");
    }
  };

  const sidebarFilters = [
    { id: 'ALL', label: 'Todo' },
    { id: 'Pendiente', label: 'Pend.' },
    { id: 'Preparando', label: 'Prep.' },
    { id: 'Listo', label: 'Listos' },
    { id: 'Pagado', label: 'Pago' }
  ];

  const stats = {
    pending: tableOrders.filter(o => o.status === 'Pendiente').length,
    preparing: tableOrders.filter(o => ['Preparando', 'Confirmado'].includes(o.status)).length,
    ready: tableOrders.filter(o => o.status === 'Listo').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Confirmado': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Preparando': return 'bg-primary/10 text-primary border-primary/20';
      case 'Listo': return 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
      case 'Pagado': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'Cancelado': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-10 relative uppercase">
      {/* Modals */}
      <Modal 
        isOpen={isAddingOrder || !!editingOrderId} 
        onClose={() => {setIsAddingOrder(false); setEditingOrderId(null);}}
        title={editingOrderId ? 'Editar' : 'Tomar'}
        subtitle="Comanda"
        maxWidth="max-w-6xl"
      >
        <div className="flex flex-col lg:flex-row h-full">
            <div className="w-full lg:w-2/3 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-900 pr-0 lg:pr-8 space-y-8 md:space-y-10 pb-10 lg:pb-0">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">01 Identificar Cliente</span></div>
                  <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                      <input type="text" placeholder="BUSCAR EN RESERVAS..." value={resSearch} onChange={(e) => setResSearch(e.target.value)} className="w-full bg-background border-2 border-zinc-200 dark:border-zinc-800 p-4 pl-12 text-xs font-bold focus:border-primary outline-none" />
                      {filteredRes.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-[100] bg-surface border-2 border-primary mt-1 shadow-2xl">
                          {filteredRes.map(res => (
                            <button key={res.id} onClick={() => handleLinkRes(res)} className="w-full p-4 hover:bg-primary/10 border-b border-zinc-900 flex justify-between items-center text-left transition-all">
                                <div>
                                  <p className="text-xs font-bold text-text-bright">{res.name}</p>
                                  <p className="text-[10px] text-text-dim uppercase tracking-tighter">
                                    {res.time} • {res.date} • {res.phone}
                                  </p>
                                </div>
                                <span className="text-[8px] bg-primary/20 text-primary px-2 py-1 font-bold uppercase">vincular</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      <input type="text" placeholder="NOMBRE COMPLETO" value={newOrder.customer_name} onChange={e => setNewOrder({...newOrder, customer_name: e.target.value.toUpperCase()})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full" />
                      <input type="text" placeholder="TELÉFONO" value={newOrder.customer_phone} onChange={e => setNewOrder({...newOrder, customer_phone: e.target.value})} className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary w-full" />
                      <select 
                        value={newOrder.table} 
                        onChange={e => setNewOrder({...newOrder, table: e.target.value})}
                        className="bg-background border-2 border-zinc-800 p-3 text-[10px] font-bold outline-none focus:border-primary uppercase w-full col-span-1 sm:col-span-2 md:col-span-1"
                      >
                        <option value="">-- SELECCIONAR MESA --</option>
                        {locations.map(loc => {
                          const locationTables = tables.filter(t => (t.locationId === loc.id) && (t.status === 'Disponible' || String(t.id) === String(newOrder.table)));
                          if (locationTables.length === 0) return null;
                          return (
                            <optgroup key={loc.id} label={loc.name.toUpperCase()} className="bg-background text-primary font-black">
                              {locationTables.map(t => (
                                <option key={t.id} value={t.id} className="bg-background text-text-bright font-bold">
                                  ID:{t.id} - MESA {t.number}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">02 Seleccionar Productos</span></div>
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
                <div className="flex items-center space-x-3 mb-6"><span className="w-8 h-px bg-primary"></span><span className="text-[10px] font-bold uppercase tracking-widest text-primary">03 Comanda Activa</span></div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar max-h-[30vh] lg:max-h-none">
                  {newOrder.items.length === 0 ? (
                    <div className="h-32 flex flex-center flex-col items-center justify-center border-2 border-dashed border-zinc-800 text-text-dim opacity-40"><ShoppingBag size={24} className="mb-2"/><p className="text-[8px] font-bold uppercase tracking-[0.2em]">Sin productos</p></div>
                  ) : (
                    newOrder.items.map(item => (
                      <div key={item.id} className="flex flex-col border-b border-zinc-800 pb-4">
                          <div className="flex justify-between items-start font-bold text-[10px] text-text-bright pr-4"><span>{item.product_name || item.name}</span><button onClick={() => removeFromCart(item.id)} className="text-accent opacity-50 hover:opacity-100"><Trash2 size={14}/></button></div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center space-x-3 bg-background border border-zinc-800 px-2 py-1"><button onClick={() => updateQty(item.id, -1)} className="text-primary font-bold px-2 hover:bg-primary/10 transition-colors">-</button><span className="font-mono text-xs">{item.quantity}</span><button onClick={() => updateQty(item.id, 1)} className="text-primary font-bold px-2 hover:bg-primary/10 transition-colors">+</button></div>
                            <span className="text-xs font-mono font-bold text-text-bright">${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
                          </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 mb-8 space-y-3">
                   <div className="flex items-center space-x-2 text-[10px] font-bold text-primary uppercase tracking-widest"><MessageSquare size={14}/><span>Observaciones</span></div>
                   <textarea 
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value.toUpperCase()})}
                    placeholder="EJ: SIN CEBOLLA, TÉRMINO MEDIO..."
                    className="w-full p-3 bg-background border-2 border-zinc-800 text-[10px] font-bold focus:border-primary outline-none min-h-[60px]"
                   />
                </div>

                <div className="border-t-4 border-primary pt-6 space-y-6">
                  <div className="flex justify-between items-center text-text-bright"><span className="text-[10px] font-bold uppercase tracking-widest">Total comanda</span><span className="text-2xl md:text-3xl font-serif text-primary tracking-tighter">${calculateTotal(newOrder.items).toFixed(2)}</span></div>
                  <Button onClick={handleSaveOrder} className="w-full text-xs font-bold uppercase tracking-[0.2em] py-5 md:py-4 shadow-[8px_8px_0px_0px_rgba(225,29,72,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all" disabled={newOrder.items.length === 0 || !newOrder.customer_name}>{editingOrderId ? 'Guardar Cambios' : 'Procesar Pedido'}</Button>
                </div>
            </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!orderToCancel}
        onClose={() => {setOrderToCancel(null); setCancelReason('');}}
        onConfirm={handleCancelConfirm}
        title="Cancelar Pedido"
        message={`¿Estás seguro de que deseas cancelar el pedido de ${tables.find(t => t.id === orderToCancel?.table)?.number || 'esta mesa'}? Esta acción anulará el servicio.`}
        confirmLabel="Anular Servicio"
      >
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Motivo de la Cancelación</label>
          <textarea 
            className="w-full p-4 bg-background border-2 border-zinc-800 text-[10px] font-bold focus:border-primary outline-none min-h-[100px] uppercase"
            placeholder="EJ: ERROR EN LA TOMA, CLIENTE SE RETIRÓ..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          {!cancelReason && <p className="text-[8px] font-bold text-accent animate-pulse">EL MOTIVO ES OBLIGATORIO PARA PROCEDER</p>}
        </div>
      </ConfirmModal>

      <AnimatePresence>
         {showInvoice && lastSavedOrder && (
           <div className="fixed inset-0 w-screen h-screen z-[700] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white text-zinc-900 w-[95%] max-w-sm p-6 md:p-8 font-mono relative shadow-2xl print-ticket overflow-hidden">
                <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6 font-bold"><h2 className="text-xl">{brand.name}</h2><p className="text-[10px] tracking-widest uppercase">{brand.tagline}</p></div>
                <div className="space-y-1 mb-8 text-[10px] uppercase">
                   <div className="flex justify-between"><span>FACTURA:</span><span className="font-bold">#ORD_{Date.now().toString().slice(-6)}</span></div>
                   <div className="flex justify-between"><span>FECHA:</span><span>{new Date().toLocaleDateString()}</span></div>
                   <div className="flex justify-between"><span>CLI:</span><span className="font-bold">{lastSavedOrder.customer_name}</span></div>
                </div>
                <div className="border-b border-zinc-200 mb-6 pb-4">
                   <div className="flex justify-between text-[10px] font-bold mb-4"><span>DESC</span><span>TOTAL</span></div>
                                       <div className="space-y-2">{lastSavedOrder.items.map((item, i) => (<div key={i} className="flex justify-between text-[10px]"><span className="max-w-[70%]">{item.quantity}x {(item.product_name || item.name).toUpperCase()}</span><span>${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span></div>))}</div>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-zinc-900 pt-2 mb-10"><span>TOTAL:</span><span>${typeof lastSavedOrder.total === 'number' ? lastSavedOrder.total.toFixed(2) : parseFloat(String(lastSavedOrder.total).replace('$', '')).toFixed(2)}</span></div>
                <div className="flex space-x-2 no-print">
                   <Button onClick={() => setShowInvoice(false)} className="flex-1 text-xs">Cerrar</Button>
                   <Button onClick={() => handlePrint(lastSavedOrder)} variant="outline" className="px-6 border-zinc-900 text-zinc-900">
                      <Printer size={16} />
                   </Button>
                </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-l-8 border-primary pl-6 md:pl-8 mb-10">
        <div>
          <h1 className="text-4xl md:text-7xl font-serif uppercase leading-none text-text-bright">Centro de <span className="text-primary italic">Comandos</span></h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">Gestión de Pedidos Presenciales</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full lg:w-auto">
           {/* Stats Row */}
           <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-2 md:p-4 flex flex-col items-center md:items-start">
                 <span className="text-[7px] md:text-[8px] font-bold text-primary tracking-widest uppercase">Pendientes</span>
                 <span className="text-lg md:text-2xl font-serif text-text-bright">{stats.pending}</span>
              </div>
              <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-2 md:p-4 flex flex-col items-center md:items-start">
                 <span className="text-[7px] md:text-[8px] font-bold text-primary tracking-widest uppercase">Cocina</span>
                 <span className="text-lg md:text-2xl font-serif text-text-bright">{stats.preparing}</span>
              </div>
              <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-2 md:p-4 flex flex-col items-center md:items-start border-b-primary">
                 <span className="text-[7px] md:text-[8px] font-bold text-green-500 tracking-widest uppercase">Listos</span>
                 <span className="text-lg md:text-2xl font-serif text-green-500">{stats.ready}</span>
              </div>
           </div>
           {/* Action Button */}
           <Button onClick={() => {setIsAddingOrder(true); setEditingOrderId(null);}} className="w-full flex items-center justify-center space-x-2 py-5 lg:py-4 shadow-[8px_8px_0px_0px_rgba(225,29,72,0.1)]">
              <Plus size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Nuevo Pedido</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
         {/* Left Side: Orders Table List (2/3) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-4">
               <div className="relative w-full md:w-64 lg:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
                  <input 
                     type="text" 
                     placeholder="BUSCAR..." 
                     value={sidebarSearch}
                     onChange={(e) => setSidebarSearch(e.target.value)}
                     className="w-full bg-background border-2 border-zinc-200 dark:border-zinc-800 p-2 pl-9 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
                  />
               </div>
               <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
                  <Filter size={12} className="text-primary flex-shrink-0 mr-1" />
                  {sidebarFilters.map(sf => (
                     <button 
                        key={sf.id} 
                        onClick={() => setSidebarFilter(sf.id)}
                        className={`px-3 py-2 text-[8px] font-bold uppercase border transition-all whitespace-nowrap ${sidebarFilter === sf.id ? 'bg-primary border-primary text-white shadow-md' : 'text-text-dim hover:text-primary border-zinc-200 dark:border-zinc-800'}`}
                     >
                        {sf.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-xl">
               <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-800 uppercase tracking-widest text-[9px] font-bold text-primary">
                           <th className="p-4">Mesa</th>
                           <th className="p-4">Cliente</th>
                           <th className="p-4">Total</th>
                           <th className="p-4">Estado</th>
                           <th className="p-4 text-right">#</th>
                        </tr>
                     </thead>
                     <tbody className="text-[11px] font-bold uppercase">
                        {filteredSidebarOrders.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="p-20 text-center opacity-30">
                                 <ClipboardList size={40} className="mx-auto mb-4" strokeWidth={0.5} />
                                 <p className="text-[9px] tracking-[0.2em]">Sin comandas</p>
                              </td>
                           </tr>
                        ) : (
                           filteredSidebarOrders.map((order) => {
                              const table = tables.find(t => t.id === order.table);
                              const isSelected = selectedOrderId === order.id;
                              
                              return (
                                 <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrderId(order.id)}
                                    className={`border-b border-zinc-100 dark:border-zinc-900 cursor-pointer transition-all hover:bg-primary/5 ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                 >
                                    <td className="p-4">
                                       <div className="flex items-center space-x-2">
                                          <MapPin size={10} className="text-primary" />
                                           <div className="flex flex-col">
                                              <span className="text-sm font-serif">Mesa {tables.find(t => String(t.id) === String(order.table))?.number || '??'}</span>
                                              <span className="text-[8px] font-bold text-text-dim uppercase">{locations.find(l => l.id === tables.find(t => String(t.id) === String(order.table))?.locationId)?.name || 'AREA'}</span>
                                           </div>
                                       </div>
                                    </td>
                                    <td className="p-4 truncate max-w-[120px]">{order.customer_name}</td>
                                    <td className="p-4 text-primary">${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(String(order.total).replace('$', '')).toFixed(2)}</td>
                                    <td className="p-4">
                                       <span className={`px-2 py-0.5 border text-[8px] ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </td>
                                     <td className="p-4 text-right text-text-dim text-[9px]">#{String(order.id).split('_').pop()}</td>
                                 </tr>
                              );
                           })
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Right Side: Order Detail (1/3) - Sticky */}
         <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
               {selectedOrder ? (
                  <motion.div 
                     key={selectedOrder.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 sticky top-10 flex flex-col shadow-2xl overflow-hidden"
                  >
                     <div className="p-6 bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-900 flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-primary tracking-widest">// DETALLE COMANDA</p>
                           <h2 className="text-2xl font-serif text-text-bright uppercase">
                              Mesa {tables.find(t => String(t.id) === String(selectedOrder.table))?.number || '??'} 
                              <span className="text-[10px] text-primary italic ml-2">({locations.find(l => l.id === tables.find(t => String(t.id) === String(selectedOrder.table))?.locationId)?.name || 'AREA'})</span>
                           </h2>
                           <p className="text-[10px] text-text-dim font-bold tracking-tighter">ORD_#{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={() => setSelectedOrderId(null)} className="p-1 text-text-dim hover:text-primary"><X size={20}/></button>
                     </div>

                     <div className="p-6 space-y-6">
                        <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-900 pb-4">
                           <div className="space-y-1">
                              <p className="text-[9px] font-bold text-text-dim uppercase tracking-widest">Cliente</p>
                              <p className="text-sm font-bold text-text-bright uppercase">{selectedOrder.customer_name}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-2xl font-serif text-primary font-bold">${typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : parseFloat(String(selectedOrder.total).replace('$', '')).toFixed(2)}</p>
                              <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                           </div>
                        </div>

                        {selectedOrder.notes && (
                           <div className="bg-primary/5 p-4 border-l-4 border-primary">
                              <p className="text-[8px] font-bold text-primary mb-1 tracking-widest uppercase italic">Observaciones</p>
                              <p className="text-[10px] font-bold text-text-bright uppercase leading-tight">"{selectedOrder.notes}"</p>
                           </div>
                        )}

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {selectedOrder.items.map((item, i) => (
                                 <div key={i} className="flex justify-between items-center text-xs md:text-sm font-bold border-b border-zinc-100 dark:border-zinc-900 pb-3 last:border-0 group hover:bg-primary/5 transition-all px-2">
                                    <div className="flex items-center space-x-4">
                                       <span className="text-lg md:text-xl font-serif text-primary w-8">{item.quantity}x</span>
                                       <span className="text-text-bright uppercase tracking-wide">{item.product_name || item.name}</span>
                                    </div>
                                    <span className="text-text-dim font-serif text-xs">${(parseFloat(String(item.price_at_order || item.price || '0').replace('$', '')) * item.quantity).toFixed(2)}</span>
                                 </div>
                              ))}
                           </div>

                        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                           <div className="flex space-x-2">
                              <Button onClick={() => {setLastSavedOrder(selectedOrder); setShowInvoice(true);}} variant="outline" className="flex-1 space-x-2 border-zinc-700 text-[9px]"><Printer size={14}/><span>Ticket</span></Button>
                              <Button variant="outline" onClick={() => handleEditClick(selectedOrder)} className="flex-1 text-[9px] border-zinc-700"><Edit2 size={14}/><span>Editar</span></Button>
                           </div>
                           {selectedOrder.status === 'Listo' && (
                              <Button onClick={() => updateOrderStatus(selectedOrder.id, 'Pagado')} className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-xl space-x-2">
                                 <CreditCard size={16}/>
                                 <span>Finalizar y Cobrar</span>
                              </Button>
                           )}

                           {selectedOrder.status !== 'Pagado' && selectedOrder.status !== 'Listo' && (
                                 <div className="flex grid grid-cols-3 gap-1">
                                     {['Pendiente', 'Preparando', 'Listo'].map((s) => (
                                         <button 
                                             key={s} 
                                             onClick={() => updateOrderStatus(selectedOrder.id, s)}
                                             className={`p-2 border border-zinc-100 dark:border-zinc-900 flex flex-col items-center gap-1 transition-all hover:bg-primary/5 ${selectedOrder.status === s ? 'border-primary text-primary bg-primary/5' : 'text-text-dim'}`}
                                             title={s}
                                         >
                                             {s === 'Pendiente' && <ClipboardList size={14} />}
                                             {s === 'Preparando' && <ChefHat size={14} />}
                                             {s === 'Listo' && <CheckCircle size={14} />}
                                             <span className="text-[7px] font-bold uppercase">{s}</span>
                                         </button>
                                     ))}
                                 </div>
                            )}
                           <button onClick={() => setOrderToCancel(selectedOrder)} className="w-full py-2 text-[9px] font-bold text-accent uppercase tracking-widest hover:underline">Cancelar Comanda</button>
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <div className="h-full border-2 border-dashed border-zinc-200 dark:border-zinc-900 flex flex-col items-center justify-center text-center p-10 opacity-30">
                     <ClipboardList size={60} strokeWidth={0.5} className="mb-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Selecciona una orden para ver detalles</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
   </div>
  );
};

export default OrdersManager;
