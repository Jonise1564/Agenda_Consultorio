const Medico = require('../models/medicosModels')// Modelo de médicos
const Persona = require('../models/personasModels')// Modelo de Personas
const Usuario = require('../models/usuariosModels')// Modelo de Usuarios
const Especialidad = require('../models/especialidadesModels') // Modelo de especialidades
const Agenda = require('../models/agendasModels') // Modelo de especialidades

const { validateAgendas, validatePartialAgendas } = require('../schemas/validationAgenda')
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

class AgendasController {
    //Mostrar todas los medicos
    async get(req, res, next) {
        console.log('Controller: Get All agendas');
        try {
            //para el filtro mostrar especialidades
            const especialidades = await Especialidad.getAll()
            //para el filtro mostrar medicos
            const medicos = await Medico.getAll()
            //traer todas las agendas
            const agendas = await Agenda.getAll()


            //formatear hora
            const agendaFormateada = agendas.map(agenda => {
                const { hora_inicio } = agenda
                const { hora_fin } = agenda
                const { fecha_creacion } = agenda
                const { fecha_fin } = agenda
                const horarInicioFormateado = obtenerHoraFormateada(hora_inicio)
                const horarfinFormateado = obtenerHoraFormateada(hora_fin)
                const fechaCreacionFormateada = obtenerFechaFormateada(new Date(fecha_creacion))
                const fechaFinFormateada = obtenerFechaFormateada(new Date(fecha_fin))
                return {
                    ...agenda,
                    hora_inicio: horarInicioFormateado,
                    hora_fin: horarfinFormateado,
                    fecha_creacion: fechaCreacionFormateada,
                    fecha_fin: fechaFinFormateada
                }
            })

            //Flags para verificar cambios con mensajes en pantalla
            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;

            let mensaje = null;
            if (nombreInactivo) {
                mensaje = 'Se ha dado de Baja a un agenda';
            } else if (nombreActivo) {
                mensaje = 'Medico ha dado de Alta a un agenda';
            } else if (nombreUpdate) {
                mensaje = 'Agenda Actualizada correctamente';
            } else if (nombreStore) {
                mensaje = 'Agenda Creada correctamente';
            }
            //renderizo al index de agendas
            res.render('agendas/inicio', { agendas: agendaFormateada, mensaje, especialidades, medicos });
        } catch (error) {
            console.error('Error al obtener agendas desde el controlador:', error);
            next(error);
        }
    }
    //vista crear
    async create(req, res) {
        try {
            console.log(`Controller: Create agenda`);

            // Obtengo las matriculas 
            const matriculas = await Medico.getAllMatriculas();
            if (!matriculas) {
                console.log('Controller agenda: matriculas no encontradas');
                return res.status(404).send('matricula no encontrado');
            }
            const dias = await Agenda.getAllDias()
            if (!dias) {
                console.log('Controller agenda: dias no encontradas');
                return res.status(404).send('dias no encontrado');
            }
            console.log('Enviando a la vista editar...');

            res.render('agendas/crear', { matriculas, dias });
        } catch (error) {
            console.error('Error los datos', error);
            next(error);
        }
    }
    //Inserta en la tabla genda    
    async store(req, res, next) {
        console.log('Controller: Create agenda');
        try {
            // Extraer datos del formulario
            let { fecha_creacion, fecha_fin, 'dia[]': dias, 'hora_inicio[]': horas_inicio, 'hora_fin[]': horas_fin, limite_sobreturnos, duracion_turnos, nromatricula, id_sucursal, id_clasificacion } = req.body;
    
            // Asegurarse de que los campos sean arrays
            if (!Array.isArray(dias)) {
                dias = [dias];
            }
            if (!Array.isArray(horas_inicio)) {
                horas_inicio = [horas_inicio];
            }
            if (!Array.isArray(horas_fin)) {
                horas_fin = [horas_fin];
            }
    
            // Validar datos
            const dateCreacion = new Date(fecha_creacion);
            const dateFin = new Date(fecha_fin);
            // Validar fechas
            const today = new Date().toISOString().split('T')[0];
            if (dateCreacion < today) {
                console.error('La fecha de creación no puede ser menor a la fecha actual');
                return res.status(404).json({ message: 'Error al crear la Agenda' });
            }
            if (dateCreacion >= dateFin) {
                console.error('La fecha de creación no puede ser mayor o igual a la fecha de fin');
                return res.status(404).json({ message: 'Error al crear la Agenda' });
            }
    
            const result = validateAgendas({ fecha_creacion: dateCreacion, fecha_fin: dateFin, limite_sobreturnos, duracion_turnos, nromatricula, id_sucursal, id_clasificacion });
            console.log('después de validar', result.data);
            if (!result.success) {
                return res.status(422).json({ error: result.error.issues });
            } else {
                console.log('Datos Validados...');
            }
    
            // Le paso datos validados y parseados
            const { fecha_creacion: fecha_c, fecha_fin: fecha_f, limite_sobreturnos: limite_s, duracion_turnos: duracion_t, nromatricula: matricula, id_sucursal: sucursal_id, id_clasificacion: clasificacion_id } = result.data;
    
            // Crear Agenda
            console.log('Controller crear Agenda');
            const agendaCreada = await Agenda.create({
                fecha_creacion: fecha_c,
                fecha_fin: fecha_f,
                dias,
                horas_inicio,
                horas_fin,
                limite_sobreturnos: limite_s,
                duracion_turnos: duracion_t,
                matricula,
                id_sucursal: sucursal_id,
                id_clasificacion: clasificacion_id
            });
    
            if (agendaCreada) {
                console.log('Controller: agenda insertada con éxito');
                res.redirect(`/agendas?nombreStore=${true}`);
            } else {
                res.status(400).json({ message: 'Error al crear la agenda' });
            }
        } catch (error) {
            console.error('Error al crear agenda desde el controlador:', error);
            res.status(400).send('Error al crear la agenda');
        }
    }    
    //editar (vista)
    async edit(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Controller: edit, agenda por DNI: ${id}`);
    
            // Obtengo las especialidades del agenda
            const agendaData = await Agenda.getAgendaById(id);
            if (!agendaData) {
                console.log('Controller Agenda: Especialidad no encontrada');
                return res.status(404).json({ message: 'Agenda no encontrado' });
            }
            console.log('Controller Agenda: Agenda encontrada:', agendaData);
    
            // Obtengo las matriculas 
            const matriculas = await Medico.getAllMatriculas();
            if (!matriculas) {
                console.log('Controller agenda: matriculas no encontradas');
                return res.status(404).send('matricula no encontrado');
            }
    
            console.log('control fechas', agendaData.fecha_creacion, typeof (agendaData.fecha_creacion));
            console.log('Enviando a la vista editar...');
    
            res.render('agendas/editar', { agenda: agendaData, matriculas, dias: agendaData.dias });
        } catch (error) {
            console.error('Error los datos', error);
            next(error);
        }
    }       
    // editar
    async update(req, res, next) {
        console.log('Controller: Update Agenda');
        try {
            const { id } = req.params;
            console.log(req.body);
            const { fecha_creacion: fc, fecha_fin: ff, 'dia[]': dias, 'hora_inicio[]': hi, 'hora_fin[]': hf, limite_sobreturnos: ls, duracion_turnos: dt, matricula: nro, sucursal: i_s, clasificacion: i_c } = req.body;
    
            // Asegurarse de que hi y hf sean arrays
            const horasInicio = Array.isArray(hi) ? hi : [hi];
            const horasFin = Array.isArray(hf) ? hf : [hf];
            const diasArray = Array.isArray(dias) ? dias : [dias];
    
            // Validar datos
            const dateCreacion = new Date(fc);
            const dateFin = new Date(ff);
    
            // Validar fechas
            const today = new Date().toISOString().split('T')[0];
            if (dateCreacion < today) {
                console.error('La fecha de creación no puede ser menor a la fecha actual');
                return res.status(404).json({ message: 'Error al crear la Agenda' });
            }
            if (dateCreacion >= dateFin) {
                console.error('La fecha de creación no puede ser mayor o igual a la fecha de fin');
                return res.status(404).json({ message: 'Error al crear la Agenda' });
            }
    
            // Asegurarse de que los valores de hora estén en el formato correcto
            const horasInicioFormateadas = horasInicio.map(hora => hora.length === 5 ? `${hora}:00` : hora);
            const horasFinFormateadas = horasFin.map(hora => hora.length === 5 ? `${hora}:00` : hora);
    
            const result = validatePartialAgendas({ fecha_creacion: dateCreacion, fecha_fin: dateFin, limite_sobreturnos: ls, duracion_turnos: dt, nromatricula: nro, id_sucursal: i_s, id_clasificacion: i_c });
            if (!result.success) {
                console.log('Error al validar datos');
                return res.status(400).json({ error: JSON.parse(result.error.message) });
            } else {
                console.log('Datos Validados...');
            }
    
            // Le paso datos validados y parseados
            const { fecha_creacion: fecha_c, fecha_fin: fecha_f, limite_sobreturnos: limite_s, duracion_turnos: duracion_t, nromatricula: matriculaNum, id_sucursal: sucursal_id, id_clasificacion: clasificacion_id } = result.data;
    
            // Convertir la fecha de nacimiento al formato YYYY-MM-DD
            const creacionFinal = fecha_c ? fecha_c.toISOString().split('T')[0] : undefined;
            const finFinal = fecha_f ? fecha_f.toISOString().split('T')[0] : undefined;
    
            // Obtengo los datos de usuario y teléfonos
            const agendaId = await Agenda.getAgendaById(id);
            if (!agendaId) {
                console.log('Controller Agenda: agenda no encontrada');
                return res.status(404).send('404 not found - Agenda no encontrada');
            }
            console.log('Controller Agenda: AGENDA encontrada:', agendaId);
    
            // Actualizar Agenda
            console.log('Controller Medico: Update Agenda horas:', horasInicioFormateadas, horasFinFormateadas);
            const updateA = {
                fecha_creacion: creacionFinal,
                fecha_fin: finFinal,
                'hora_inicio[]': horasInicioFormateadas,
                'hora_fin[]': horasFinFormateadas,
                limite_sobreturnos: limite_s,
                duracion_turnos: duracion_t,
                matricula: matriculaNum,
                id_sucursal: sucursal_id,
                id_clasificacion: clasificacion_id,
                dias: diasArray
            };
    
            const updatedAgenda = await Agenda.updateAgenda(id, updateA);
            console.log('Resultado de updateAgenda:', updatedAgenda);
            if (!updatedAgenda) {
                return res.status(404).json({ message: 'Error al modificar la agenda desde AgendaController' });
            }
            res.redirect(`/agendas?nombreUpdate=${true}`);
        } catch (error) {
            next(error);
        }
    }         
    // eliminar
    async eliminarAgenda(req, res, next) {
        console.log('Controller: Eliminar agenda');
        try {
            const { id } = req.params;
            const resultado = await Agenda.eliminar(id);
            if (!resultado) {
                return res.status(500).json({ message: 'Error al eliminar la agenda' });
            }
            res.status(200).json({ message: 'Agenda eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar agenda desde el controlador:', error);
            res.status(400).send('Error al eliminar la agenda'); next(error);
        }
    }
}

module.exports = new AgendasController()