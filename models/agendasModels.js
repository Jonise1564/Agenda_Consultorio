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
    //mostrar agenda por id
    static async getAgendaById(id) {
        console.log('Models: get by id')
        let conn
        try {
            conn = await createConnection()
            const [agenda] = await conn.query(`
                    SELECT a.id, a.limite_sobreturnos, a.fecha_creacion, a.fecha_fin, a.hora_inicio, a.hora_fin, a.duracion_turnos, a.matricula, s.nombre sucursal, c.nombre clasificacion 
                    FROM agendas a 
                    JOIN sucursales s ON a.id_sucursal = s.id 
                    JOIN clasificaciones c ON a.id_clasificacion = c.id 
                    WHERE a.id = ?;
                `, [id])
            return agenda
        } catch (error) {
            console.error('Error al traer la agenda by id', error)
            throw new Error('Error al traer agenda desde el modeo')
        } finally {
            if (conn) conn.end()
        }
    }
    //insertar agenda
    static async create({
        fecha_creacion,
        fecha_fin,
        hora_inicio,
        hora_fin,
        limite_sobreturnos,
        duracion_turnos,
        matricula,
        id_sucursal,
        id_clasificacion }) {
        console.log('Model: Create agenda',);
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();
            //llama a la funcion crear agenda e inserta agenda y turnos
            const [resultAgenda] = await conn.query(`
              CALL crear_agenda(?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [limite_sobreturnos, fecha_creacion, fecha_fin, hora_inicio, hora_fin, duracion_turnos, matricula, id_sucursal, id_clasificacion]);

            if (resultAgenda.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla agenda');
            }

            await conn.commit();

            console.log('Agenda creada exitosamente', resultAgenda);
            return true
        } catch (error) {
            if (conn) await conn.rollback();
            console.error('Error creating agenda:', error);
            throw new Error('Error al crear agenda');
        } finally {
            if (conn) conn.end();
        }
    }
    // update agenda
    static async updateAgenda(id, updates) {
        console.log('Model: update agenda');
        try {
            console.log('en modelo', updates)
            const {
                fecha_creacion,
                fecha_fin,
                hora_inicio,
                hora_fin,
                limite_sobreturnos,
                duracion_turnos,
                matricula,
                id_sucursal,
                id_clasificacion
            } = updates
            const conn = await createConnection();

            const [result] = await conn.query(`
                    CALL modificar_agenda(?, ?, ?, ?, ?, ?, ?, ?, ?,?)
                `, [id, limite_sobreturnos, fecha_creacion, fecha_fin, hora_inicio, hora_fin, duracion_turnos, matricula, id_sucursal, id_clasificacion])
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al modificar Agenda desde el modelo:', error);
            throw new Error('Error al modificar Agenda desde el modelo');
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









