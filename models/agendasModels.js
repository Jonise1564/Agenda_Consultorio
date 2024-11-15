const createConnection = require('../config/configDb');
const { update } = require('../controllers/agendasControllers');
//const Usuario = require('./usuariosModels'); // clase padre

class Agenda {
    constructor(id, fecha_creacion, fecha_fin, hora_inicio, hora_fin, duracion_turnos, limite_sobreturnos, matricula, id_sucursal, id_clasificacion) {
        this.id,
            this.fecha_creacion,
            this.fecha_fin,
            this.hora_inicio,
            this.hora_fin,
            this.duracion_turnos,
            this.limite_sobreturnos,
            this.matricula,
            this.id_sucursal,
            this.id_clasificacion
    }
    //Mostrar todos
    static async getAll() {
        console.log('Model: Get All agendas');
        let conn;
        try {
            conn = await createConnection();
            const [agendas] = await conn.query(`
    SELECT a.id, a.fecha_creacion, a.fecha_fin, p.nombre AS nombre, p.apellido AS apellido,
    GROUP_CONCAT(d.dia ORDER BY d.dia SEPARATOR ', ') AS dias,
    dd.hora_inicio,
    dd.hora_fin,
    a.limite_sobreturnos,
    a.duracion_turnos,
    e.nombre AS especialidad,
    s.nombre AS sucursal,
    c.nombre AS clasificacion
FROM agendas a
JOIN dias_disponibles dd ON a.id = dd.id_agenda
JOIN dias d ON dd.dia = d.id
JOIN medico_especialidad me ON a.matricula = me.matricula
JOIN especialidades e ON me.id_especialidad = e.id
JOIN usuarios u ON me.id_medico = u.id
JOIN personas p ON u.dni = p.dni
JOIN sucursales s ON a.id_sucursal = s.id
JOIN clasificaciones c ON a.id_clasificacion = c.id
GROUP BY 
    a.id, 
    a.fecha_creacion, 
    a.fecha_fin, 
    p.nombre, 
    p.apellido, 
    dd.hora_inicio, 
    dd.hora_fin, 
    a.limite_sobreturnos, 
    a.duracion_turnos, 
    e.nombre, 
    s.nombre, 
    c.nombre
ORDER BY 
    dd.hora_inicio, 
    dd.hora_fin;

            `);
            return agendas
        } catch (error) {
            console.error('Error fetching agendas:', error);
            throw new Error('Error al traer agendas desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }
    //mostrar dias en el select de crear
    static async getAllDias() {
        console.log('Models: get all dias')
        let conn
        try {
            conn = await createConnection()
            const [dias] = await conn.query(`
                    SELECT * FROM dias;
                `)
            return dias
        } catch (error) {
            console.error('Error al traer los dias', error)
            throw new Error('Error al traer dias desde el modelo')
        } finally {
            if (conn) conn.end()
        }
    }
    //insertar agenda
    static async create({
        fecha_creacion,
        fecha_fin,
        dias,
        horas_inicio,
        horas_fin,
        limite_sobreturnos,
        duracion_turnos,
        matricula,
        id_sucursal,
        id_clasificacion
    }) {
        console.log('Model: Create agenda');
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            // Llama al procedimiento almacenado para crear la agenda
            const [resultAgenda] = await conn.query(`
                CALL insertar_agenda(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                fecha_creacion,
                fecha_fin,
                limite_sobreturnos,
                duracion_turnos,
                matricula,
                id_sucursal,
                id_clasificacion,
                JSON.stringify(dias),
                JSON.stringify(horas_inicio),
                JSON.stringify(horas_fin)
            ]);

            if (resultAgenda.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla agendas');
            }

            await conn.commit();

            console.log('Agenda creada exitosamente', resultAgenda);
            return true;
        } catch (error) {
            if (conn) await conn.rollback();
            console.error('Error creating agenda:', error);
            throw new Error('Error al crear agenda');
        } finally {
            if (conn) conn.end();
        }
    }
    // get agenda by id
   
        static async getAgendaById(id) {
            console.log('Models: get by id');
            let conn;
            try {
                conn = await createConnection();
                const [agenda] = await conn.query(`
                    SELECT a.id, a.limite_sobreturnos, a.fecha_creacion, a.fecha_fin, a.duracion_turnos, a.matricula, a.id_sucursal, s.nombre sucursal, a.id_clasificacion, c.nombre clasificacion 
                    FROM agendas a 
                    JOIN sucursales s ON a.id_sucursal = s.id 
                    JOIN clasificaciones c ON a.id_clasificacion = c.id 
                    WHERE a.id = ?;
                `, [id]);
    
                const [diasDisponibles] = await conn.query(`
                    SELECT dia, hora_inicio, hora_fin 
                    FROM dias_disponibles 
                    WHERE id_agenda = ?;
                `, [id]);
    
                const [dias] = await conn.query(`
                    SELECT id, dia 
                    FROM dias;
                `);
    
                return { ...agenda[0], diasDisponibles, dias };
            } catch (error) {
                console.error('Error al traer la agenda by id', error);
                throw new Error('Error al traer agenda desde el modelo');
            } finally {
                if (conn) conn.end();
            }
        }
    
        static async updateAgenda(id, updates) {
            console.log('Model: update agenda');
            let conn;
            try {
                console.log('en modelo', updates);
                const {
                    fecha_creacion,
                    fecha_fin,
                    'hora_inicio[]': horas_inicio,
                    'hora_fin[]': horas_fin,
                    limite_sobreturnos,
                    duracion_turnos,
                    matricula,
                    id_sucursal,
                    id_clasificacion,
                    dias
                } = updates;
    
                conn = await createConnection();
    
                // Obtener los valores actuales de la agenda
                const [agendaActual] = await conn.query(`
                    SELECT fecha_creacion, fecha_fin, limite_sobreturnos, duracion_turnos, matricula, id_sucursal, id_clasificacion
                    FROM agendas
                    WHERE id = ?;
                `, [id]);
    
                const valoresActuales = agendaActual[0];
    
                // Asegurarse de que horas_inicio y horas_fin sean arrays
                const horasInicio = horas_inicio || [];
                const horasFin = horas_fin || [];
    
                // Actualizar la tabla agendas
                await conn.query(`
                    UPDATE agendas
                    SET fecha_creacion = ?, fecha_fin = ?, limite_sobreturnos = ?, duracion_turnos = ?, matricula = ?, id_sucursal = ?, id_clasificacion = ?
                    WHERE id = ?;
                `, [
                    fecha_creacion || valoresActuales.fecha_creacion,
                    fecha_fin || valoresActuales.fecha_fin,
                    limite_sobreturnos || valoresActuales.limite_sobreturnos,
                    duracion_turnos || valoresActuales.duracion_turnos,
                    matricula || valoresActuales.matricula,
                    id_sucursal || valoresActuales.id_sucursal,
                    id_clasificacion || valoresActuales.id_clasificacion,
                    id
                ]);
    
                // Borrar los días disponibles y turnos asociados a la agenda
                await conn.query(`DELETE FROM dias_disponibles WHERE id_agenda = ?;`, [id]);
                await conn.query(`DELETE FROM turnos WHERE id_agenda = ?;`, [id]);
    
                // Insertar los nuevos días disponibles
                for (let i = 0; i < horasInicio.length; i++) {
                    await conn.query(`
                        INSERT INTO dias_disponibles (id_agenda, dia, hora_inicio, hora_fin)
                        VALUES (?, ?, ?, ?);
                    `, [id, dias[i], horasInicio[i], horasFin[i]]);
                }
    
                // Generar turnos para cada día entre las fechas
                const fechaInicio = new Date(fecha_creacion || valoresActuales.fecha_creacion);
                const fechaFin = new Date(fecha_fin || valoresActuales.fecha_fin);
                const diasSemana = dias.map(dia => parseInt(dia, 10));
    
                for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
                    const diaSemana = fecha.getDay();
                    if (diasSemana.includes(diaSemana)) {
                        const index = diasSemana.indexOf(diaSemana);
                        let turnoInicio = horasInicio[index];
                        const turnoFin = horasFin[index];
    
                        while (turnoInicio < turnoFin) {
                            await conn.query(`
                                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                                VALUES (?, ?, NULL, 'Libre', NULL, NULL, ?);
                            `, [fecha, turnoInicio, id]);
    
                            // Insertar sobreturnos
                            for (let j = 1; j <= limite_sobreturnos; j++) {
                                await conn.query(`
                                    INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                                    VALUES (?, ?, NULL, 'Sobreturno', ?, NULL, ?);
                                `, [fecha, turnoInicio, j, id]);
                            }
    
                            turnoInicio = new Date(new Date(`1970-01-01T${turnoInicio}Z`).getTime() + duracion_turnos * 60000).toISOString().substr(11, 5);
                        }
                    }
                }
    
                return true;
            } catch (error) {
                console.error('Error al modificar Agenda desde el modelo:', error);
                throw new Error('Error al modificar Agenda desde el modelo');
            } finally {
                if (conn) conn.end();
            }
        }

    
    // Eliminar Agenda
    static async eliminar(id) {
        let conn
        try {
            conn = await createConnection();
            await conn.beginTransaction();
            const [result] = await conn.query('CALL eliminar_agenda(?)', [id]);
            if (result.affectedRows === 0) {
                throw new Error('Error al eliminar la agenda');
            }
            await conn.commit(); return result;
        } catch (error) {
            if (conn)
                await conn.rollback();
            console.error('Error eliminando la agenda:', error);
            throw new Error('Error al eliminar la agenda');
        } finally {
            if (conn)
                conn.end();
        }
    }
}
module.exports = Agenda;









