// Función para formatear la hora a HH:MM
const obtenerHoraFormateada = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  
  };

  // Función para formatear múltiples horarios
const obtenerHorariosFormateados = (times) => {
  return times.map(time => obtenerHoraFormateada(time));
};
  
  module.exports = { obtenerHoraFormateada, obtenerHorariosFormateados };
  