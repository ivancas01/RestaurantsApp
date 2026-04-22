import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Plus, Trash2, Edit2, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';

const PersonnelManager = () => {
  const { users, groups, PERMISSIONS, setGroups, setUsers } = useAdmin();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('users');
  
  // Modal States
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // New Group State
  const [newGroup, setNewGroup] = useState({ name: '', permissions: [] });
  const [newUser, setNewUser] = useState({ 
    name: '', 
    username: '', 
    password: '',
    confirmPassword: '',
    email: '',
    identification: '',
    phone: '',
    groupId: groups[1]?.id || '' 
  });
  const [editingUserId, setEditingUserId] = useState(null);

  const togglePermission = (perm) => {
    setNewGroup(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSaveGroup = () => {
    if (!newGroup.name) return;
    const groupToAdd = { 
      id: `group_${Date.now()}`, 
      name: newGroup.name, 
      permissions: newGroup.permissions 
    };
    setGroups([...groups, groupToAdd]);
    setNewGroup({ name: '', permissions: [] });
    setIsEditingGroup(false);
    showNotification(`Grupo ${newGroup.name} configurado`);
  };

  const startEditUser = (user) => {
    setNewUser({ ...user, confirmPassword: user.password });
    setEditingUserId(user.id);
    setIsEditingUser(true);
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      showNotification("Nombre, Usuario y Contraseña son obligatorios", "error");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      showNotification("Las contraseñas no coinciden", "error");
      return;
    }
    
    if (editingUserId) {
      const { confirmPassword, ...userData } = newUser;
      setUsers(users.map(u => u.id === editingUserId ? { ...userData, id: editingUserId } : u));
      showNotification(`Perfil de ${newUser.name} actualizado`);
    } else {
      const { confirmPassword, ...userData } = newUser;
      const userToAdd = {
        id: `user_${Date.now()}`,
        ...userData,
        active: true
      };
      setUsers([...users, userToAdd]);
      showNotification(`Operador ${newUser.name} registrado`);
    }
    
    setNewUser({ name: '', username: '', password: '', confirmPassword: '', email: '', identification: '', phone: '', groupId: groups[1]?.id || '' });
    setEditingUserId(null);
    setIsEditingUser(false);
  };

  const deleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
    showNotification("Personal retirado del sistema", "warning");
  };

  const deleteGroup = () => {
    if (!groupToDelete) return;
    const { id } = groupToDelete;
    if (['super_admin', 'chef', 'waiter'].includes(id)) {
       // In a real app we'd show a modal alert instead of native alert
       alert("Este grupo de sistema no puede ser eliminado.");
       setGroupToDelete(null);
       return;
    }
    setGroups(groups.filter(g => g.id !== id));
    setGroupToDelete(null);
  };

  return (
    <div className="space-y-10">
      {/* Modals */}
      <Modal 
        isOpen={isEditingUser} 
        onClose={() => setIsEditingUser(false)} 
        title="Gestionar" 
        subtitle="Operador"
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Grupo / Rol de Sistema</label>
              <select 
                className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-[10px] font-bold uppercase transition-all focus:border-primary outline-none"
                value={newUser.groupId}
                onChange={(e) => setNewUser({...newUser, groupId: e.target.value})}
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
           </div>
           
           <Button onClick={handleSaveUser} className="w-full py-4 uppercase tracking-widest font-bold text-xs">{editingUserId ? 'Actualizar Perfil' : 'Registrar Operador'}</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isEditingGroup} 
        onClose={() => setIsEditingGroup(false)} 
        title="Configurar" 
        subtitle="Rol de Sistema"
      >
        <div className="space-y-8">
           <Input label="Nombre del Grupo" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} placeholder="Ej. Bartender / Hostess" />
           <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Asignar Permisos Tácticos</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {Object.entries(PERMISSIONS).map(([key, value]) => (
                   <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                      <input type="checkbox" className="hidden" checked={newGroup.permissions.includes(value)} onChange={() => togglePermission(value)} />
                      <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${newGroup.permissions.includes(value) ? 'bg-primary border-primary' : 'border-zinc-700 group-hover:border-primary'}`}>
                         {newGroup.permissions.includes(value) && <Lock size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${newGroup.permissions.includes(value) ? 'text-text-bright' : 'text-text-dim'}`}>{key.replace('_', ' ')}</span>
                   </label>
                 ))}
              </div>
           </div>
           <div className="flex space-x-4 pt-6">
              <Button onClick={handleSaveGroup} className="flex-1">Confirmar Rol</Button>
              <Button variant="outline" onClick={() => setIsEditingGroup(false)} className="flex-1 border-zinc-700">Descartar</Button>
           </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={deleteUser}
        title="Eliminar Personal"
        message={`¿Estás seguro de que deseas retirar a ${userToDelete?.name} del sistema? Esta acción revocará todos sus accesos.`}
      />

      <ConfirmModal 
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={deleteGroup}
        title="Eliminar Grupo"
        message={`¿Estás seguro de que deseas eliminar el grupo "${groupToDelete?.name}"? Los usuarios asignados perderán sus permisos.`}
      />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8">
        <div>
          <h1 className="text-3xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Control de <span className="text-primary italic">Personal</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Gestión de Accesos y Seguridad
          </p>
        </div>
        
        <div className="flex bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-1 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 md:px-6 py-2 uppercase tracking-widest text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary'}`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`flex-1 md:px-6 py-2 uppercase tracking-widest text-[9px] md:text-[10px] font-bold transition-all ${activeTab === 'groups' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary'}`}
          >
            Grupos
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900 pb-4">
            <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider text-text-bright">Staff <span className="text-primary italic">Activo</span></h2>
            <Button onClick={() => setIsEditingUser(true)} className="flex items-center space-x-2 py-2 px-4">
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
                      {group?.name || 'Huerfano'}
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
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center text-text-bright border-b border-zinc-200 dark:border-zinc-900 pb-4">
            <h2 className="text-xl md:text-2xl font-serif uppercase tracking-wider">Grupos de <span className="text-primary italic">Permisos</span></h2>
            <Button onClick={() => setIsEditingGroup(true)} className="flex items-center space-x-2 py-2 px-4">
              <Shield size={16} />
              <span className="text-[10px] md:text-xs">Nuevo</span>
            </Button>
          </div>

          <div className="space-y-4 md:space-y-6 max-w-4xl">
             {groups.map((group) => (
               <div key={group.id} className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group/card transition-all hover:border-primary">
                  <div className="flex items-center space-x-4 md:space-x-6">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-zinc-100 dark:bg-white/5 border-2 border-primary/20 flex items-center justify-center text-primary group-hover/card:bg-primary group-hover/card:text-white transition-all">
                        <Shield size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg md:text-xl font-serif uppercase text-text-bright">{group.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                           {group.permissions.map(p => (
                             <span key={p} className="text-[7px] md:text-[8px] uppercase font-bold tracking-tighter text-text-dim border border-zinc-800 px-1.5 py-0.5">{p}</span>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex space-x-1 sm:space-x-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-4 sm:pt-0">
                     <button onClick={() => { setIsEditingGroup(true); setNewGroup({ ...group }); }} className="p-2 text-text-dim hover:text-primary"><Edit2 size={18}/></button>
                     <button onClick={() => setGroupToDelete(group)} className="p-2 text-text-dim hover:text-accent"><Trash2 size={18} /></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelManager;
