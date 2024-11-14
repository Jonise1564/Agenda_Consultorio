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

            console.log('Enviando a la vista editar...');

            res.render('agendas/crear', { matriculas });
        } catch (error) {
            console.error('Error los datos', error);
            next(error);
        }
    }
    //guardar agenda creada
    //Inserta en la tabla Medico
    async store(req, res, next) {

        console.log('Controller: Create agenda');
        try {
            // Extraer datos del formulario
            const { fecha_creacion: fc, fecha_fin: ff, hora_inicio: hi, hora_fin: hf, limite_sobreturnos: ls, duracion_turnos: dt, nromatricula: m, id_sucursal: is, id_clasificacion: ic } = req.body;

            // Validar datos
            const dateCreacion = new Date(fc)
            const dateFin = new Date(ff)
            //validar fechas
            const today = new Date().toISOString().split('T')[0];
            if (dateCreacion < today) {
                console.error('La fecha de creación no puede ser menor a la fecha actual');
                return res.status(404).json({ message: 'Error al crear el Agenda' });
            }
            if (dateCreacion >= dateFin) {
                console.error('La fecha de creación no puede ser mayor o igual a la fecha de fin');
                return res.status(404).json({ message: 'Error al crear el Agenda' });
            }

            const result = validateAgendas({ fecha_creacion: dateCreacion, fecha_fin: dateFin, hora_inicio: hi, hora_fin: hf, limite_sobreturnos: ls, duracion_turnos: dt, nromatricula: m, id_sucursal: is, id_clasificacion: ic });

            if (!result.success) {
                console.log('Error al validar datos');
                return res.status(422).json({ error: result.error.issues });
            } else { console.log('Datos Validados...'); }
            //le paso datos validados y parseados
            const { fecha_creacion: fecha_c, fecha_fin: fecha_f, hora_inicio: hora_i, hora_fin: hora_f, limite_sobreturnos: limite_s, duracion_turnos: duracion_t, nromatricula: nromatricula, id_sucursal: sucursal_id, id_clasificacion: clasificacion_id } = result.data;

            // Convertir la fecha de nacimiento al formato YYYY-MM-DD
            const creacionFinal = fecha_c.toISOString().split('T')[0];
            const finFinal = fecha_f.toISOString().split('T')[0];


            // Crear Agenda
            console.log('Controller crear Agenda')
            const agendaCreada = await Agenda.create({
                fecha_creacion: creacionFinal,
                fecha_fin: finFinal,
                hora_inicio: hora_i,
                hora_fin: hora_f,
                limite_sobreturnos: limite_s,
                duracion_turnos: duracion_t,
                matricula: nromatricula,
                id_sucursal: sucursal_id,
                id_clasificacion: clasificacion_id
            });
            if (agendaCreada) {
                console.log('Controller: agenda insertada con éxito');
                res.redirect(`/agendas?nombreStore=${true}`);
            } else {
                res.status(400).json({ message: 'Error al crear el agenda' });
            }
        } catch (error) {
            console.error('Error al crear agenda desde el controlador:', error); res.status(400).send('Error al crear la agenda');
        }
    }
    //editar (vista)
    async edit(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Controller: edit, agenda por DNI: ${id}`);

            // Obtengo las especialidades del agenda
            const [agendaData] = await Agenda.getAgendaById(id);
            if (!agendaData || agendaData.length === 0) {
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


            console.log('control fechas', agendaData.fecha_creacion, typeof (agendaData.fecha_creacion))
            console.log('Enviando a la vista editar...');

            res.render('agendas/editar', { agenda: agendaData, matriculas });
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
            console.log(req.body)
            const { fecha_creacion: fc, fecha_fin: ff, hora_inicio: hi, hora_fin: hf, limite_sobreturnos: ls, duracion_turnos: dt, martricula: nro, sucursal: i_s, clasificacion: i_c } = req.body;
            // Validar datos

            const dateCreacion = new Date(fc)
            const dateFin = new Date(ff)

            //validar fechas
            const today = new Date().toISOString().split('T')[0];
            if (dateCreacion < today) {
                console.error('La fecha de creación no puede ser menor a la fecha actual');
                return res.status(404).json({ message: 'Error al crear el Agenda' });
            }
            if (dateCreacion >= dateFin) {
                console.error('La fecha de creación no puede ser mayor o igual a la fecha de fin');
                return res.status(404).json({ message: 'Error al crear el Agenda' });
            }

            const result = validatePartialAgendas({ fecha_creacion: dateCreacion, fecha_fin: dateFin, hora_inicio: hi, hora_fin: hf, limite_sobreturnos: ls, duracion_turnos: dt, nromatricula: nro, id_sucursal: i_s, id_clasificacion: i_c });
            if (!result.success) {
                console.log('Error al validar datos');
                return res.status(400).json({ error: JSON.parse(result.error.message) });
            } else {
                console.log('Datos Validados...');
            }

            //le paso datos validados y parseados
            const { fecha_creacion: fecha_c, fecha_fin: fecha_f, hora_inicio: hora_i, hora_fin: hora_f, limite_sobreturnos: limite_s, duracion_turnos: duracion_t, nromatricula: matriculaNum, id_sucursal: sucursal_id, id_clasificacion: clasificacion_id } = result.data;

            // Convertir la fecha de nacimiento al formato YYYY-MM-DD
            const creacionFinal = fecha_c.toISOString().split('T')[0];
            const finFinal = fecha_f.toISOString().split('T')[0];

            // Obtengo los datos de usuario y telefonos
            const agendaId = await Agenda.getAgendaById(id);
            if (!agendaId) {
                console.log('Controller Agenda: agenda no encontrada');
                return res.status(404).send('404 not found - Agenda no encontrada');
            }
            console.log('Controller Agenda: AGENDA encontrada:', agendaId);

            // Actualizar Agenda
            console.log('Controller Medico: Update Agenda');
            const updateA = {
                fecha_creacion: creacionFinal,
                fecha_fin: finFinal,
                hora_inicio: hora_i,
                hora_fin: hora_f,
                limite_sobreturnos: limite_s,
                duracion_turnos: duracion_t,
                matricula: matriculaNum,
                id_sucursal: sucursal_id,
                id_clasificacion: clasificacion_id
            }

            const updatedAgenda = await Agenda.updateAgenda(id, updateA);
            console.log('Resultado de updateAgenda:', updatedAgenda);
            if (!updatedAgenda) {
                return res.status(404).json({ message: 'Error al modificar el agenda desde AgendaController' });
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