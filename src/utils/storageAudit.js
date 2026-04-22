/**
 * Utility to audit LocalStorage usage for the Lumina Urban Gourmet app.
 */
export const auditStorage = () => {
  let total = 0;
  const auditData = [];

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = (localStorage[key].length * 2) / 1024; // size in KB
      total += size;
      auditData.push({ key, size: size.toFixed(2) + ' KB' });
    }
  }

  console.group('%c 📊 Auditoría de Almacenamiento Lumina', 'color: #e11d48; font-weight: bold; font-size: 14px;');
  console.table(auditData);
  console.log(`%c TOTAL USADO: ${total.toFixed(2)} KB / 5120 KB`, `color: ${total > 4000 ? '#f43f5e' : '#10b981'}; font-weight: bold;`);
  console.groupEnd();

  return { total, auditData };
};
