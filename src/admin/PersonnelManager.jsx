import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Plus, Trash2, Edit2, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';

const PersonnelManager = () => {
  const { users, groups, addUser, updateUser, deleteUser, fetchPersonnelData, pagination } = useAdmin();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    fetchPersonnelData(currentPage);
  }, [fetchPersonnelData, currentPage]);
  
  // Modal States
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // New User State
  const [newUser, setNewUser] = useState({ 
    name: '', 
    username: '', 
    password: '',
    confirmPassword: '',
    email: '',
    identification: '',
    phone: '',
    groupId: groups[0]?.id || '' 
  });
  const [editingUserId, setEditingUserId] = useState(null);

  const startCreateUser = () => {
    setNewUser({ 
      name: '', 
      username: '', 
      password: '',
      confirmPassword: '',
      email: '',
      identification: '',
      phone: '',
      groupId: groups[0]?.id || '' 
    });
    setEditingUserId(null);
    setIsEditingUser(true);
  };

  const startEditUser = (user) => {
    setNewUser({ ...user, confirmPassword: user.password });
    setEditingUserId(user.id);
    setIsEditingUser(true);
  };

  const closeUserModal = () => {
    setIsEditingUser(false);
    setNewUser({ 
      name: '', 
      username: '', 
      password: '',
      confirmPassword: '',
      email: '',
      identification: '',
      phone: '',
      groupId: groups[0]?.id || '' 
    });
    setEditingUserId(null);
  };

  const handleSaveUser = async () => {
    if (!newUser.name.trim() || !newUser.username.trim() || (editingUserId ? false : !newUser.password)) {
      showNotification("Nombre, Usuario y Contraseña son obligatorios", "error");
      return;
    }

    if (newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      showNotification("El formato de correo no es válido", "error");
      return;
    }

    if (newUser.phone && newUser.phone.replace(/\D/g, '').length < 7) {
      showNotification("El número de teléfono debe tener al menos 7 dígitos", "error");
      return;
    }

    if (newUser.password && newUser.password !== newUser.confirmPassword) {
      showNotification("Las contraseñas no coinciden", "error");
      return;
    }
    
    const { confirmPassword, ...userData } = newUser;
    
    if (editingUserId) {
      await updateUser(editingUserId, userData);
      showNotification(`Perfil de ${newUser.name} actualizado`);
    } else {
      await addUser(userData);
      showNotification(`Colaborador ${newUser.name} registrado`);
    }
    
    setNewUser({ name: '', username: '', password: '', confirmPassword: '', email: '', identification: '', phone: '', groupId: groups[0]?.id || '' });
    setEditingUserId(null);
    setIsEditingUser(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
    showNotification("Colaborador retirado del sistema", "warning");
  };

  return (
    <div className="space-y-10">
      {/* Modals */}
      <Modal 
        isOpen={isEditingUser} 
        onClose={closeUserModal} 
        title={editingUserId ? "Editar" : "Registrar"} 
        subtitle="Colaborador"
        maxWidth="max-w-xl"
      >
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nombre Completo" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Ej. Juan Perez" />
              <Input label="Identificación (ID)" value={newUser.identification} onChange={(e) => setNewUser({...newUser, identification: e.target.value})} placeholder="123456789" />
              <Input label="Número de Celular" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} placeholder="300 123 4567" />
              <Input label="Correo Electrónico" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="correo@ejemplo.com" />
              <Input label="Usuario (Login)" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} placeholder="ej. jperez" />
              <div className="hidden md:block"></div> {/* Spacer for alignment */}
              <Input label="Contraseña" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
              <Input label="Confirmar Contraseña" type="password" value={newUser.confirmPassword} onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} placeholder="••••••••" />
           </div>

           <div className="flex flex-col space-y-2 border-t border-zinc-800 pt-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Rol / Permisos del Sistema</label>
              <select 
                className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-[10px] font-bold uppercase transition-all focus:border-primary outline-none"
                value={newUser.groupId}
                onChange={(e) => setNewUser({...newUser, groupId: e.target.value})}
              >
                <option value="">Elegir Rol</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
           </div>
           
           <Button onClick={handleSaveUser} className="w-full py-4 uppercase tracking-widest font-bold text-xs">{editingUserId ? 'Actualizar Perfil' : 'Registrar Colaborador'}</Button>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Eliminar Colaborador"
        message={`¿Estás seguro de que deseas retirar a ${userToDelete?.name} del equipo? Esta acción revocará todos sus accesos.`}
      />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8">
        <div>
          <h1 className="text-3xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Control de <span className="text-primary italic">Colaboradores</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Gestión de Accesos y Seguridad
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900 pb-4">
          <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider text-text-bright">Colaboradores <span className="text-primary italic">Activos</span></h2>
          <Button onClick={startCreateUser} className="flex items-center space-x-2 py-2 px-4">
            <Plus size={16} />
            <span className="text-[10px] md:text-xs">Nuevo</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {users.map((user) => {
            const group = groups.find(g => g.id === user.groupId);
            return (
              <div key={user.id} className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 md:p-8 relative group overflow-hidden hover:border-primary transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full transition-all group-hover:scale-150"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-serif text-xl md:text-2xl">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex space-x-2">
                     <button onClick={() => startEditUser(user)} className="p-1.5 bg-background border border-zinc-200 dark:border-zinc-800 text-text-dim hover:text-primary transition-all shadow-sm">
                       <Edit2 size={16}/>
                     </button>
                     <button onClick={() => setUserToDelete(user)} className="p-1.5 bg-background border border-zinc-200 dark:border-zinc-800 text-text-dim hover:text-accent transition-all shadow-sm">
                       <Trash2 size={16}/>
                     </button>
                  </div>
                </div>

                <div className="mt-6 space-y-1 relative z-10 text-text-bright">
                  <h3 className="text-lg md:text-xl font-serif uppercase truncate">{user.name}</h3>
                  <p className="text-[9px] md:text-[10px] text-text-dim uppercase tracking-widest font-bold flex items-center space-x-2">
                    <span className="text-primary">@{user.username}</span>
                    {user.email && <span className="opacity-50">• {user.email}</span>}
                  </p>
                  {user.phone && <p className="text-[9px] text-text-dim opacity-70 uppercase tracking-widest mt-1">{user.phone}</p>}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-4 relative z-10">
                  <span className="bg-primary/20 text-primary text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 uppercase tracking-widest">
                    {group?.name || 'Colaborador'}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-green-500">
                     <CheckCircle size={10} />
                     <span>Activo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination 
          current={currentPage} 
          total={pagination.users} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};

export default PersonnelManager;
