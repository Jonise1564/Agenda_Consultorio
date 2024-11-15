const createConnection = require('../config/configDb');

class Turno {
    constructor(id, fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda) {
        this.id = id;
        this.fecha = fecha;
        this.hora_inicio = hora_inicio;
        this.motivo = motivo;
        this.estado = estado;
        this.orden = orden;
        this.id_paciente = id_paciente;
        this.id_agenda = id_agenda;
    }

    // Mostrar todos los turnos
    static async getAll(id) {
        console.log('Model: Get All turnos');
        let conn;
        try {
            conn = await createConnection();
            const [turnos] = await conn.query(`
                SELECT * FROM turnos WHERE id_agenda = ?;
            `, [id]);
            return turnos;
        } catch (error) {
            console.error('Error fetching turnos:', error);
            throw new Error('Error al traer turnos desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // Actualizar un turno
    static async update(id, updates) {
        console.log('Model: Update turno');
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda } = updates;

            const [result] = await conn.query(`
                UPDATE turnos
                SET fecha = ?, hora_inicio = ?, motivo = ?, estado = ?, orden = ?, id_paciente = ?, id_agenda = ?
                WHERE id = ?;
            `, [fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda, id]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating turno:', error);
            throw new Error('Error al actualizar turno desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // Crear un nuevo turno
    static async create(turno) {
        console.log('Model: Create turno');
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda } = turno;

            const [result] = await conn.query(`
                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `, [fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda]);

            return result.insertId;
        } catch (error) {
            console.error('Error creating turno:', error);
            throw new Error('Error al crear turno desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }
    static async reservar(id) {
        console.log('Model Paciente: reservar turno');
        try {
            const conn = await createConnection();
            const query = 'UPDATE turnos SET estado = "Reservado" WHERE id = ?';
            const [result] = await conn.query(query, [id]);
    
            console.log('Resultado de la consulta SQL:', result);
            console.log('Filas afectadas:', result.affectedRows);
    
            if (result.affectedRows === 0) {
                throw new Error('No se encontró el TUrnos con el id proporcionado');
            }
    
            console.log('Model: turnos activado exitosamente');
            return result.affectedRows === 1;
        } catch (error) {
            console.error('Error al activar turnos desde el modelo:', error);
            throw new Error('Error al activar turnos desde el modelo');
        }
    }
    static async bloquear(id) {
        console.log('Model Paciente: bloquear turno');
        try {
            const conn = await createConnection();
            const query = 'UPDATE turnos SET estado = "No Disponible" WHERE id = ?';
            const [result] = await conn.query(query, [id]);
    
            console.log('Resultado de la consulta SQL:', result);
            console.log('Filas afectadas:', result.affectedRows);
    
            if (result.affectedRows === 0) {
                throw new Error('No se encontró el TUrnos con el id proporcionado');
            }
    
            console.log('Model: turnos INACTIVADO exitosamente');
            return result.affectedRows === 1;
        } catch (error) {
            console.error('Error al inactivado turnos desde el modelo:', error);
            throw new Error('Error al inactivado turnos desde el modelo');
        }
    }
}

module.exports = Turno;
