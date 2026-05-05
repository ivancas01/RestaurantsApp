import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { MapPin, Info, CheckCircle } from 'lucide-react';

const Select = ({ label, className = "", children, ...props }) => {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {label}
        </label>
      )}
      <div className="relative w-full group">
        <select 
          className="input-field w-full px-4 appearance-none" 
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim/40 group-focus-within:text-primary transition-colors">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const LocationVisualizer = ({ selectedLocation, persons, className = "" }) => (
  <div className={`mt-8 border-2 border-primary/30 p-4 bg-background relative group overflow-hidden shadow-[4px_4px_0px_0px_rgba(225,29,72,0.1)] ${className}`}>
     <div className="absolute top-0 right-0 p-2 text-[8px] font-bold text-primary opacity-50 tracking-widest uppercase">Visualizer v1.0</div>
     <div className="aspect-video bg-zinc-200 dark:bg-zinc-900 mb-6 overflow-hidden relative border border-white/5">
        {selectedLocation?.image ? (
          <motion.img 
            key={selectedLocation.id}
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            src={selectedLocation.image} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
             <MapPin size={40} strokeWidth={1} />
             <p className="text-[10px] font-bold uppercase mt-4 tracking-[0.3em]">Selecciona una Zona</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
     </div>
     
     <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end">
           <h4 className="text-sm md:text-lg font-serif uppercase tracking-widest text-primary leading-none">
              {selectedLocation ? selectedLocation.name : 'Sector No Asignado'}
           </h4>
           {selectedLocation && (
             <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter animate-pulse">● En Línea</span>
           )}
        </div>
        <div className="h-px bg-primary/20 w-full"></div>
        <p className="text-[10px] text-text-dim uppercase tracking-widest leading-relaxed">
           {selectedLocation 
             ? `Ubicación verificada. Capacidad táctica optimizada para ${persons} agentes.` 
             : 'Pendiente de selección de zona para visualización de coordenadas.'}
        </p>
     </div>
  </div>
);

const ReservationSection = () => {
  const { cmsData = {}, locations = [], addReservation } = useAdmin() || {};
  const cmsReservations = cmsData?.reservations || {
    title: "Reserva // Tu Espacio",
    subtitle: "Únete a la energía de la ciudad. Sin pretensiones, solo buen sabor y mejor ambiente.",
    help_text: "Para grupos de más de 8 personas, por favor contáctanos directamente vía telefónica."
  };
  const safeTitle = cmsReservations.title || "Reserva // Tu Espacio";
  const [titleMain, titleItalic] = safeTitle.includes('//') ? safeTitle.split('//').map(s => s.trim()) : [safeTitle, ''];

  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    persons: 2,
    locationId: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es requerido';
    if (!formData.identification.trim()) newErrors.identification = 'La identificación es requerida';
    if (!formData.phone.trim()) newErrors.phone = 'El número de teléfono es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.locationId) newErrors.locationId = 'Por favor selecciona una ubicación';
    
    // Email validation (optional)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del correo es inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await addReservation({
          ...formData,
          status: 'Pendiente',
          method: 'web'
        });
        setSubmitted(true);
        // Reset form
        setFormData({
          name: '',
          identification: '',
          phone: '',
          email: '',
          date: '',
          time: '',
          persons: 2,
          locationId: '',
          instructions: ''
        });
      } catch (err) {
        setErrors(prev => ({ ...prev, submit: 'Error al conectar con el servidor. Reintenta.' }));
      }
    }
  };

  const selectedLocation = locations.find(l => String(l.id) === String(formData.locationId));


    return (
      <section id="reserva" className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-[6rem] md:text-[10rem] font-serif opacity-[0.03] select-none uppercase hidden sm:block pointer-events-none">BOOK</div>
        
        <div className="container max-w-6xl bg-surface border-2 border-primary/20 p-6 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Gritty detail */}
          <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-primary"></div>
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col lg:flex-row gap-12 lg:gap-16"
              >
                <div className="lg:w-[40%]">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl mb-6 leading-[0.8] break-words">
                    {titleMain} <br /> <span className="text-primary italic">{titleItalic}</span>
                  </h2>
                  <p className="text-text-dim uppercase tracking-widest text-[10px] md:text-xs leading-relaxed mb-8 md:mb-10">
                    {cmsReservations.subtitle}
                  </p>
                  
                  {/* Visualizador de Ubicación - Desktop */}
                  <LocationVisualizer 
                    selectedLocation={selectedLocation} 
                    persons={formData.persons} 
                    className="hidden lg:block" 
                  />

                <div className="mt-8 md:mt-12 space-y-4 hidden lg:block">
                  <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] underline decoration-2 underline-offset-8">Información // SOPORTE</p>
                  <p className="text-xs text-text-dim max-w-[250px]">
                    {cmsReservations.help_text}
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-8">
                  {/* Personal Info */}
                  <div className="md:col-span-2 flex items-center space-x-4 mb-2">
                     <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase whitespace-nowrap">// 01 INFO PERSONAL</span>
                     <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10"></div>
                  </div>
                  
                  <div className="space-y-1">
                    <Input 
                      label="Nombre Completo" 
                      placeholder="Ej. Alexander Pierce" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    {errors.name && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      label="Identificación / ID" 
                      placeholder="Ej. 10203040" 
                      value={formData.identification}
                      onChange={(e) => setFormData({...formData, identification: e.target.value})}
                    />
                    {errors.identification && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.identification}</p>}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      label="Teléfono Móvil" 
                      placeholder="+57 3XX XXX XXXX" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                    {errors.phone && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      label="Email (Opcional)" 
                      type="email" 
                      placeholder="ejemplo@urban.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {errors.email && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.email}</p>}
                  </div>

                  {/* Booking Details */}
                  <div className="md:col-span-2 flex items-center space-x-4 mt-4 md:mt-6 mb-2">
                     <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase whitespace-nowrap">// 02 DETALLES RESERVA</span>
                     <div className="flex-1 h-px bg-zinc-200 dark:bg-white/10"></div>
                  </div>

                  <div className="space-y-1">
                    <Input 
                      label="Fecha" 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                    {errors.date && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.date}</p>}
                  </div>

                  <div className="space-y-1">
                    <Input 
                      label="Hora" 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                    {errors.time && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.time}</p>}
                  </div>

                  <div className="space-y-1">
                    <Select 
                      label="Escuadrón (Pax)"
                      value={formData.persons}
                      onChange={(e) => setFormData({...formData, persons: parseInt(e.target.value)})}
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(p => (
                         <option key={p} value={p}>{p} {p === 1 ? 'Persona' : 'Personas'}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Select 
                      label="Zona de Desembarco"
                      value={formData.locationId}
                      onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      {locations.map(loc => (
                         <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </Select>
                    {errors.locationId && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">{errors.locationId}</p>}
                  </div>

                  {/* Visualizador de Ubicación - Mobile */}
                  <div className="lg:hidden md:col-span-2">
                    <LocationVisualizer 
                      selectedLocation={selectedLocation} 
                      persons={formData.persons} 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-col space-y-2 mt-2">
                      <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">Instrucciones Especiales</label>
                      <textarea 
                        className="input-field min-h-[100px] py-4"
                        placeholder="Alergias, cumpleaños o peticiones de zona..." 
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-6 md:mt-10">
                    {errors.submit && <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-4 text-center animate-pulse">{errors.submit}</p>}
                    <Button type="submit" className="w-full text-lg md:text-xl py-6">
                       <span>CONFIRMAR DESEMBARCO</span>
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8"
            >
               <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-primary flex items-center justify-center text-primary mb-4">
                  <CheckCircle size={40} md:size={48} strokeWidth={1} />
               </div>
               <h3 className="text-4xl md:text-5xl font-serif uppercase text-text-bright">Operación <span className="text-primary italic">Exitosa</span></h3>
               <p className="text-text-dim uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold max-w-lg text-xs md:text-sm">
                  Hemos registrado tu reserva. Nuestro equipo táctico verificará la disponibilidad y te contactará en breve.
               </p>
               <Button onClick={() => setSubmitted(false)} variant="outline">Hacer otra reserva</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ReservationSection;
