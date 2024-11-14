const createConnection = require('../config/configDb');
//const Usuario = require('./usuariosModels'); // clase padre

class Turno {
    constructor(id, fecha, hora_inicio, motivo,	estado,	orden, id_paciente, id_agenda) {
        this.id,
        this.fecha,
        this.hora_inicio,
        this.motivo,
        this.estado,
        this.orden,
        this.id_paciente,
        this.id_agenda  
    }
    //Mostrar todos
    static async getAll(id) {
        console.log('Model: Get All turnos');
        let conn;
        try {
            conn = await createConnection();
            const [turnos] = await conn.query(`
               SELECT * FROM turnos WHERE id_agenda = ?;
            `, [id]);
            console.log('modelo ',turnos)
            return turnos
        } catch (error) {
            console.error('Error fetching turnos:', error);
            throw new Error('Error al traer turnos desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }
}
module.exports = Turno;


