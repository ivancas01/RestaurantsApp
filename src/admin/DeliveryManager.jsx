import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Search, Trash2, Printer, MapPin, Phone, CheckCircle, XCircle, CreditCard, ShoppingBag, Eye, X, ChefHat, Clock, MessageSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';

const DeliveryManager = () => {
  const { orders, updateOrderStatus, deleteOrder, updateOrder } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const { showNotification } = useNotification();
  
  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    const itemsHtml = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; font-family: 'Courier New', Courier, monospace;">
        <span>${item.quantity}x ${item.name.toUpperCase()}</span>
        <span>$${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Ticket Web #${order.id}</title>
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
            <h1>LUMINA URBAN</h1>
            <p>Gourmet Command Center // Web</p>
          </div>
          <div class="meta">
            <div><span>ID:</span> <span>#${order.id.split('_')[1]}</span></div>
            <div><span>Fecha:</span> <span>${new Date().toLocaleDateString()}</span></div>
            <div><span>Cliente:</span> <span>${order.customer}</span></div>
            <div><span>Dir:</span> <span>${order.address}</span></div>
            <div><span>Tel:</span> <span>${order.phone}</span></div>
          </div>
          <div class="items">${itemsHtml}</div>
          <div class="total">
            <span>TOTAL PAGADO</span>
            <span>$${order.total.toFixed(2)}</span>
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
  
  // Filter only delivery orders
  const deliveryOrders = orders.filter(o => o.type === 'delivery');
  
  const filteredOrders = deliveryOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return (o.customer || '').toLowerCase().includes(searchLower) || 
           (o.address || '').toLowerCase().includes(searchLower) ||
           (o.id || '').toLowerCase().includes(searchLower);
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleDelete = (id) => {
    if (window.confirm('¿Deseas eliminar este registro de domicilio?')) {
      deleteOrder(id);
      setSelectedOrderId(null);
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
    <div className="space-y-10 uppercase">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-l-8 border-primary pl-6 md:pl-8 mb-10">
        <div>
          <h1 className="text-4xl md:text-7xl font-serif uppercase leading-none text-text-bright">Logística <span className="text-primary italic">Web</span></h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">Rastreo de Pedidos WhatsApp</p>
        </div>
        
        <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-4 flex flex-col items-center md:items-start min-w-[200px]">
           <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Entregas Activas</span>
           <span className="text-2xl font-serif text-text-bright">{deliveryOrders.filter(o => !o.isPaid).length}</span>
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
               <div className="overflow-x-auto scrollbar-hide">
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
                           filteredOrders.map((order) => {
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
                                          <p className="text-sm font-serif text-text-bright">{order.customer}</p>
                                          <p className="text-[8px] text-text-dim tracking-widest">{order.phone}</p>
                                       </div>
                                    </td>
                                    <td className="p-4 truncate max-w-[250px] text-text-dim lowercase font-normal italic">{order.address}</td>
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
                                             <span>Pagado</span>
                                          </span>
                                       ) : (
                                          <span className="text-text-dim/40 text-[8px] tracking-widest">Pendiente</span>
                                       )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                       <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="p-2 text-accent hover:bg-accent/10 transition-all"><Trash2 size={14}/></button>
                                       <button className="p-2 text-primary hover:bg-primary/10 transition-all"><Eye size={14}/></button>
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
                           <h2 className="text-2xl font-serif text-text-bright uppercase">{selectedOrder.customer}</h2>
                           <p className="text-[10px] text-text-dim font-bold tracking-tighter">ID: {selectedOrder.id}</p>
                        </div>
                        <button onClick={() => setSelectedOrderId(null)} className="p-1 text-text-dim hover:text-primary"><X size={20}/></button>
                     </div>

                     <div className="p-6 space-y-6">
                        <div className="space-y-4">
                           <div className="flex items-start space-x-3">
                              <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Dirección de Entrega</p>
                                 <p className="text-xs font-bold text-text-bright uppercase leading-relaxed">{selectedOrder.address}</p>
                              </div>
                           </div>
                           <div className="flex items-start space-x-3">
                              <Phone size={16} className="text-primary flex-shrink-0 mt-1" />
                              <div className="space-y-1">
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest">Canal de Enlace</p>
                                 <p className="text-xs font-bold text-text-bright">{selectedOrder.phone}</p>
                              </div>
                           </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4">
                           <p className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase mb-4">Ítems Solicitados</p>
                           <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                              {selectedOrder.items.map((item, i) => (
                                 <div key={i} className="flex justify-between items-center text-[10px] font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2 last:border-0">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="text-text-dim">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
                                 </div>
                              ))}
                           </div>
                           <div className="mt-4 flex justify-between items-center text-xl font-serif text-text-bright border-t-2 border-primary pt-2">
                              <span>TOTAL</span>
                              <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                           </div>
                        </div>

                        <div className="space-y-3 pt-4">
                           <p className="text-[8px] font-bold text-text-dim uppercase tracking-widest text-center mb-2">Flujo de Producción</p>
                           
                           {/* Enviar a Cocina Button */}
                           <Button 
                              onClick={() => updateOrderStatus(selectedOrder.id, 'En Lista')}
                              disabled={['En Lista', 'Preparando', 'Listo', 'Confirmado'].includes(selectedOrder.status)}
                              className={`w-full py-4 text-[10px] space-x-2 border-2 ${['En Lista', 'Preparando', 'Listo', 'Confirmado'].includes(selectedOrder.status) ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700' : 'bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(225,29,72,0.2)]'}`}
                           >
                              {selectedOrder.status === 'Listo' ? (
                                 <><CheckCircle size={14}/><span className="text-green-500">Producción Completada</span></>
                              ) : ['En Lista', 'Preparando', 'Confirmado'].includes(selectedOrder.status) ? (
                                 <><Clock size={14}/><span>En Proceso de Cocina</span></>
                              ) : (
                                 <><ChefHat size={14}/><span>Enviar a Cocina</span></>
                              )}
                           </Button>

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
                                 onClick={() => updateOrder(selectedOrder.id, { isPaid: true })}
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
                           <button 
                              onClick={() => handleDelete(selectedOrder.id)}
                              className="w-full py-3 border-2 border-accent text-accent text-[9px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all flex items-center justify-center space-x-2"
                           >
                              <Trash2 size={14}/><span>Borrar Registro</span>
                           </button>
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
           <div className="fixed inset-0 w-screen h-screen z-[700] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, y: 50 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9 }} 
               className="bg-white text-zinc-900 w-[95%] max-w-sm p-6 md:p-8 font-mono relative shadow-2xl print-ticket overflow-hidden"
             >
                <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6 font-bold">
                  <h2 className="text-xl">Lumina Urban</h2>
                  <p className="text-[10px] tracking-widest uppercase">Gourmet Command Center // Web</p>
                </div>
                
                <div className="space-y-1 mb-8 text-[10px] uppercase">
                   <div className="flex justify-between"><span>FACTURA:</span><span className="font-bold">#WEB_{selectedOrder.id.split('_')[1]}</span></div>
                   <div className="flex justify-between"><span>FECHA:</span><span>{new Date().toLocaleDateString()}</span></div>
                   <div className="flex justify-between"><span>CLIENTE:</span><span className="font-bold">{selectedOrder.customer}</span></div>
                   <div className="flex justify-between"><span>DIRECCIÓN:</span><span className="font-bold truncate max-w-[150px]">{selectedOrder.address}</span></div>
                </div>

                <div className="border-b border-zinc-200 mb-6 pb-4">
                   <div className="flex justify-between text-[10px] font-bold mb-4"><span>DESC</span><span>TOTAL</span></div>
                   <div className="space-y-2">
                     {selectedOrder.items.map((item, i) => (
                       <div key={i} className="flex justify-between text-[10px]">
                         <span className="max-w-[70%]">{item.quantity}x {item.name.toUpperCase()}</span>
                         <span>${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="flex justify-between text-lg font-bold border-t-2 border-zinc-900 pt-2 mb-10">
                   <span>TOTAL:</span>
                   <span>${selectedOrder.total.toFixed(2)}</span>
                </div>

                <div className="flex space-x-2 no-print">
                   <Button onClick={() => setShowInvoice(false)} className="flex-1 text-xs">Cerrar</Button>
                   <Button onClick={() => handlePrint(selectedOrder)} variant="outline" className="px-6 border-zinc-900 text-zinc-900">
                      <Printer size={16} />
                   </Button>
                </div>
                
                <p className="text-center mt-8 text-[8px] opacity-40 uppercase tracking-[0.3em]">Urban Street // Digital Receipt</p>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveryManager;
