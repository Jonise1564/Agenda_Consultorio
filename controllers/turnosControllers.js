const Turno = require('../models/turnosModels');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

class TurnosController {
    // Mostrar todos los turnos
    async get(req, res, next) {
        console.log('Controller: Get All turnos');
        try {
            const { id } = req.params;
            const { estado } = req.query; // Obtener el estado del filtro

            let turnos = await Turno.getAll(id);

            // Filtrar turnos por estado si se proporciona
            if (estado) {
                turnos = turnos.filter(turno => turno.estado === estado);
            }

            // Formatear turnos
            const turnosFormateado = turnos.map(turno => {
                const { hora_inicio, fecha } = turno;
                const horarInicioFormateado = obtenerHoraFormateada(hora_inicio);
                const fechaFormateada = obtenerFechaFormateada(new Date(fecha));
                return {
                    ...turno,
                    hora_inicio: horarInicioFormateado,
                    fecha: fechaFormateada,
                };
            });

            // Flags para verificar cambios con mensajes en pantalla
            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;

            let mensaje = null;
            if (nombreInactivo) {
                mensaje = 'Se ha dado de Baja a un turno';
            } else if (nombreActivo) {
                mensaje = 'Medico ha dado de Alta a un turno';
            } else if (nombreUpdate) {
                mensaje = 'Turno Actualizado correctamente';
            } else if (nombreStore) {
                mensaje = 'Turno Creado correctamente';
            }

            // Renderizar al index de turnos
            res.render('turnos/index', { turnos: turnosFormateado, mensaje });
        } catch (error) {
            console.error('Error al obtener turnos desde el controlador:', error);
            next(error);
        }
    }
    async reservar(req, res, next) {
        console.log('Controller: reservar turno');
        try {
            let flag = false
            const { id } = req.params; // 
            console.log
            const result = await Turno.reservar(id);
            if (!result) {
                return res.status(404).json({ message: 'Error al activar el turno desde TurnoController' });
            }
            flag = true
            res.redirect(`/turnos/${id}?nombreActivo=${flag}`);
        } catch (error) {
            next(error);
        }
    }

    async bloquear(req, res, next) {
        console.log('Controller: bloquear turno');
        try {
            let flag = false
            const { id } = req.params; // 
            console.log
            const result = await Turno.bloquear(id);
            if (!result) {
                return res.status(404).json({ message: 'Error al inactivado el turno desde TurnoController' });
            }
            flag = true
            res.redirect(`/turnos/${id}?nombreInactivo=${flag}`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TurnosController();
