import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Plus, Trash2, Edit2, Tag, DollarSign, Image as ImageIcon, Check, X, Upload } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useNotification } from '../context/NotificationContext';

const ProductsManager = () => {
  const { menu, addCategory, editCategory, removeCategory, addProduct, editProduct, removeProduct } = useAdmin();
  const { showNotification } = useNotification();
  const [selectedCategoryId, setSelectedCategoryId] = useState(menu[0]?.id || null);
  const [isEditing, setIsEditing] = useState(null); // { catId, itemId } or { catId, isNew: true }
  const [itemToDelete, setItemToDelete] = useState(null); // { catId, itemId, name }
  
  // Category management states
  const [isEditingCategory, setIsEditingCategory] = useState(null); // { id, name } or { isNew: true }
  const [categoryToDelete, setCategoryToDelete] = useState(null); // { id, name }
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  const selectedCategory = menu.find(c => c.id === selectedCategoryId);

  const handleToggleStatus = async (catId, itemId) => {
    const category = menu.find(c => c.id === catId);
    const item = category?.products.find(p => p.id === itemId);
    if (item) {
      await editProduct(catId, itemId, { is_available: !item.is_available });
      showNotification("Estado del producto actualizado");
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    const { catId, itemId } = itemToDelete;
    await removeProduct(catId, itemId);
    setItemToDelete(null);
    showNotification("Producto eliminado correctamente");
  };

  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', image: '', is_available: true });

  const startEdit = (catId, item = null) => {
    if (item) {
      setIsEditing({ catId, itemId: item.id });
      setEditForm({ ...item, image_preview: item.image });
    } else {
      setIsEditing({ catId, isNew: true });
      setEditForm({ name: '', price: '$', description: '', image: '', image_preview: '', image_file: null, is_available: true });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, image_file: file, image_preview: previewUrl });
    }
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      showNotification("El nombre del producto es obligatorio", "error");
      return;
    }
    if (!editForm.price) {
      showNotification("El precio es obligatorio", "error");
      return;
    }
    if (isEditing.isNew) {
      await addProduct(isEditing.catId, editForm);
      showNotification("Nuevo producto registrado");
    } else {
      await editProduct(isEditing.catId, isEditing.itemId, editForm);
      showNotification("Producto actualizado correctamente");
    }
    setIsEditing(null);
  };

  // Category Logic
  const startEditCategory = (cat = null) => {
    if (cat) {
      setIsEditingCategory({ id: cat.id });
      setCategoryForm({ name: cat.name });
    } else {
      setIsEditingCategory({ isNew: true });
      setCategoryForm({ name: '' });
    }
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      showNotification("El nombre de la categoría es obligatorio", "error");
      return;
    }
    
    if (isEditingCategory.isNew) {
      const newCat = await addCategory({ name: categoryForm.name });
      if (newCat) setSelectedCategoryId(newCat.id);
      showNotification("Nueva categoría añadida");
    } else {
      await editCategory(isEditingCategory.id, { name: categoryForm.name });
      showNotification("Categoría actualizada");
    }
    setIsEditingCategory(null);
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    await removeCategory(categoryToDelete.id);
    if (selectedCategoryId === categoryToDelete.id) {
      setSelectedCategoryId(menu[0]?.id || null);
    }
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-12">
      {/* Modals for Products */}
      <Modal 
        isOpen={!!isEditing} 
        onClose={() => setIsEditing(null)}
        title={isEditing?.isNew ? 'Nuevo' : 'Editar'}
        subtitle="Producto"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <Input label="Nombre del Plato" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value.toUpperCase()})} />
              
              <div className="flex flex-col space-y-4">
                 <Input label="Precio" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                 
                 <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Imagen del Platillo</label>
                    <div className="flex items-center space-x-4">
                       <div className="w-20 h-20 bg-background border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
                          {editForm.image_preview ? (
                            <img src={editForm.image_preview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-text-dim/30" />
                          )}
                       </div>
                       <label className="flex-1 border-2 border-dashed border-zinc-800 hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center p-4">
                          <Upload size={18} className="text-primary mb-1" />
                          <span className="text-[10px] font-bold uppercase text-text-dim">Subir desde PC</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                       </label>
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex flex-col space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Disponibilidad en Carta</label>
                <div 
                  onClick={() => setEditForm({...editForm, is_available: !editForm.is_available})}
                  className="flex items-center space-x-4 cursor-pointer group"
                >
                    <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${editForm.is_available !== false ? 'bg-green-500' : 'bg-zinc-800'}`}>
                       <motion.div 
                         layout
                         className="w-4 h-4 bg-white rounded-full shadow-sm"
                         animate={{ x: editForm.is_available !== false ? 20 : 0 }}
                       />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${editForm.is_available !== false ? 'text-text-bright' : 'text-text-dim'}`}>
                       {editForm.is_available !== false ? 'Disponible para Venta' : 'Fuera de Stock / Agotado'}
                    </span>
                </div>
              </div>
           </div>

           <div className="space-y-6 flex flex-col h-full">
              <div className="flex flex-col space-y-2 flex-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Descripción del Plato</label>
                 <textarea 
                   className="w-full h-full px-4 py-3 bg-zinc-100 dark:bg-background border-2 border-zinc-200 dark:border-zinc-800 text-text-bright text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all min-h-[150px]"
                   value={editForm.description}
                   onChange={(e) => setEditForm({...editForm, description: e.target.value.toUpperCase()})}
                 />
              </div>
              <div className="flex justify-end pt-8">
                 <Button onClick={saveEdit} className="text-xs font-bold uppercase tracking-[0.3em] px-20 py-4 shadow-[10px_10px_0px_0px_rgba(225,29,72,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                    Guardar Cambios
                 </Button>
              </div>
           </div>
        </div>
      </Modal>

      {/* Modals for Categories */}
      <Modal
        isOpen={!!isEditingCategory}
        onClose={() => setIsEditingCategory(null)}
        title={isEditingCategory?.isNew ? 'Nueva' : 'Editar'}
        subtitle="Categoría"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
           <Input label="Nombre de la Categoría" value={categoryForm.name} onChange={(e) => setCategoryForm({ name: e.target.value.toUpperCase() })} placeholder="EJ. ENTRADAS, BEBIDAS..." />
           <div className="flex justify-end pt-4">
             <Button onClick={saveCategory} className="text-[10px] font-bold uppercase tracking-widest px-12">{isEditingCategory?.isNew ? 'Crear' : 'Actualizar'}</Button>
           </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={deleteItem}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
      />

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={deleteCategory}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar "${categoryToDelete?.name}"? Se eliminarán todos los productos dentro de esta categoría.`}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-8 border-primary pl-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Gestor de <span className="text-primary italic">Menú</span>
          </h1>
          <p className="text-text-dim tracking-[0.4em] text-xs uppercase mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Catálogo Gastronómico Actual
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-3 md:space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2 md:mb-6">// CATEGORÍAS</p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
            {menu.map((cat) => (
              <div key={cat.id} className="relative group/cat flex-shrink-0 lg:flex-shrink-1 min-w-[120px] lg:min-w-0">
                <button
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left p-3 md:p-4 uppercase tracking-widest text-[9px] md:text-[10px] font-bold border-2 transition-all ${
                    selectedCategoryId === cat.id 
                      ? 'bg-primary border-primary text-white translate-x-1 shadow-lg' 
                      : 'bg-surface border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary hover:text-primary'
                  }`}
                >
                  <span className="truncate block pr-6">{cat.name.split('//')[0]}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-100 lg:opacity-0 lg:group-hover/cat:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); startEditCategory(cat); }} className={`p-1 hover:text-primary ${selectedCategoryId === cat.id ? 'text-white' : 'text-text-dim'}`}><Edit2 size={12}/></button>
                   <button onClick={(e) => { e.stopPropagation(); setCategoryToDelete({ id: cat.id, name: cat.name }); }} className={`p-1 hover:text-accent ${selectedCategoryId === cat.id ? 'text-white' : 'text-text-dim'}`}><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={() => startEditCategory()}
              className="flex-shrink-0 lg:flex-shrink-1 px-4 py-2 text-[9px] md:text-[10px] border-dashed opacity-50 hover:opacity-100 italic border-primary text-primary"
            >
              + Añadir
            </Button>
          </div>
        </div>

        {/* Products List */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="flex justify-between items-center border-b-2 border-zinc-200 dark:border-zinc-900 pb-4">
             <h2 className="text-xl md:text-3xl font-serif uppercase tracking-widest text-text-bright truncate pr-4">
                {selectedCategory?.name.split('//')[0] || 'SIN SELECCIÓN'}
             </h2>
             {selectedCategoryId && (
               <Button onClick={() => startEdit(selectedCategoryId)} className="flex items-center space-x-2 py-2 px-4 md:py-3 md:px-6">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Agregar Platillo</span>
                  <span className="sm:hidden text-[10px]">Agregar</span>
               </Button>
             )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {(selectedCategory?.products || []).map((item, idx) => (
              <div key={item.id || `prod-${idx}`} className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 group hover:border-primary transition-all relative">
                <div className="w-full sm:w-32 h-48 sm:h-32 bg-zinc-100 dark:bg-zinc-800 border border-white/5 flex-shrink-0 relative overflow-hidden">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   {!item.is_available && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white -rotate-12 bg-accent px-2">Agotado</span>
                      </div>
                   )}
                </div>

                <div className="flex-1 space-y-3 md:space-y-4">
                   <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                         <h4 className="text-lg md:text-xl font-serif uppercase text-text-bright tracking-tight truncate">{item.name}</h4>
                         <p className="text-primary font-bold text-base md:text-lg">{item.price}</p>
                      </div>
                      <div className="flex space-x-2 md:space-x-3 bg-background/50 backdrop-blur-sm p-1">
                         <button onClick={() => startEdit(selectedCategoryId, item)} className="p-1.5 md:p-1 text-text-dim hover:text-primary transition-colors"><Edit2 size={16}/></button>
                         <button onClick={() => setItemToDelete({ catId: selectedCategoryId, itemId: item.id, name: item.name })} className="p-1.5 md:p-1 text-text-dim hover:text-accent transition-colors"><Trash2 size={16}/></button>
                      </div>
                   </div>
                   
                   <p className="text-[9px] md:text-[10px] text-text-dim uppercase tracking-widest leading-relaxed line-clamp-2 md:line-clamp-3">{item.description}</p>
                   
                   <div className="pt-2 md:pt-4 flex items-center justify-between sm:justify-start sm:space-x-6 border-t border-white/5 sm:border-0">
                      <button 
                        onClick={() => handleToggleStatus(selectedCategoryId, item.id)}
                        className={`flex items-center space-x-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-colors py-2 ${item.is_available !== false ? 'text-green-500 hover:text-primary' : 'text-text-dim hover:text-green-500'}`}
                      >
                         {item.is_available !== false ? <Check size={14}/> : <X size={14}/>}
                         <span>{item.is_available !== false ? 'Disponible' : 'Fuera de Stock'}</span>
                      </button>
                   </div>
                </div>
              </div>
            ))}

            {selectedCategory && (selectedCategory.products || []).length === 0 && (
              <div className="xl:col-span-2 h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-900 flex flex-col items-center justify-center opacity-30 text-text-bright">
                <Coffee size={48} strokeWidth={1} />
                <p className="uppercase tracking-[0.3em] font-bold text-xs mt-4">No hay productos en esta categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsManager;
