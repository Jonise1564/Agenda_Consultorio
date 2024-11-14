const createConnection = require('../config/configDb');

class Especialidad {
    //Mostrar todos
    static async getAll() {
        let conn;
        try {
            conn = await createConnection();
            const [especialidades] = await conn.query('SELECT id, nombre, estado FROM especialidades');
            return especialidades;
        } catch (error) {
            console.error('Error fetching especialidades:', error);
            throw new Error('Error al traer especialidades desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    static async create({ id_usuario, estado, especialidades, telefonos, matricula }) {
        console.log('Model: Create medico');
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            // Insertar en la tabla medicos
            const [resultMedicos] = await conn.query(`
                INSERT INTO medicos (id_usuario, estado)
                VALUES (?, ?)
            `, [id_usuario, estado]);

            if (resultMedicos.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla medicos');
            }

            // Verificar si la matrícula ya existe en la tabla medico_especialidad
            const [resultMatriculas] = await conn.query(`
                SELECT matricula FROM medico_especialidad WHERE matricula = ?;
            `, [matricula]);

            if (resultMatriculas.length > 0) {
                console.error('Model: Matricula duplicada para medico', matricula);
                throw new Error('Matrícula duplicada');
            }

            // Insertar en la tabla medico_especialidades
            const [resultEspecialidades] = await conn.query(`
                INSERT INTO medico_especialidad (id_medico, id_especialidad, matricula)
                VALUES (?, ?, ?)
            `, [id_usuario, especialidades, matricula]);

            if (resultEspecialidades.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla medico_especialidad');
            }

            // Insertar en la tabla telefonos
            const [resultTelefonos] = await conn.query(`
                INSERT INTO telefonos (id_usuario, numero)
                VALUES (?, ?)
            `, [id_usuario, telefonos]);

            if (resultTelefonos.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla telefonos');
            }

            await conn.commit();
            return id_usuario;
        } catch (error) {
            if (conn) await conn.rollback();
            console.error('Error creating medico:', error);
            throw new Error('Error al crear medico');
        } finally {
            if (conn) conn.end();
        }
    }
    static async createNewEspecialidad(especialidad) {
        let conn;
        try {
            conn = await createConnection();

            // Check if the especialidad already exists
            const [existingEspecialidad] = await conn.query(`
                SELECT id FROM especialidades WHERE nombre = ?
            `, [especialidad]);

            if (existingEspecialidad.length > 0) {
                throw new Error('La especialidad ya existe');
            }

            // If not existing, insert the new especialidad
            const [result] = await conn.query(`
                INSERT INTO especialidades (nombre)
                VALUES (?)
            `, [especialidad]);

            return result;
        } catch (error) {
            console.error('Error creating especialidad:', error);
            throw new Error(error.message || 'Error al crear especialidad');
        } finally {
            if (conn) conn.end();
        }
    }

    // static async createNewEspecialidad(especialidad) {
    //     let conn;
    //     try {
    //         conn = await createConnection();
    //         const [result] = await conn.query(`
    //             INSERT INTO especialidades (nombre)
    //             VALUES (?)
    //         `, [especialidad]);
    //         return result;
    //     } catch (error) {
    //         console.error('Error creating especialidad:', error);
    //         throw new Error('Error al crear especialidad');
    //     } finally {
    //         if (conn) conn.end();
    //     }   
    // }
    static async inactivate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE especialidades SET estado = 0 WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error inactivating especialidad:', error);
            throw new Error('Error al inactivar especialidad');
        } finally {
            if (conn) conn.end();
        }
    }
    static async activate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE especialidades SET estado = 1 WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error activating especialidad:', error);
            throw new Error('Error al activar especialidad');
        } finally {
            if (conn) conn.end();
        }
    }
    static async getEspecialidadById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [especialidad] = await conn.query('SELECT id, nombre, estado FROM especialidades WHERE id = ?', [id]);
            return especialidad;
        } catch (error) {
            console.error('Error fetching especialidad:', error);
            throw new Error('Error al traer especialidad desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }
    static async updateEspecialidad(id, especialidad) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE especialidades SET nombre = ? WHERE id = ?', [especialidad, id]);
            return result;
        } catch (error) {
            console.error('Error updating especialidad:', error);
            throw new Error('Error al actualizar especialidad');
        } finally {
            if (conn) conn.end();
        }
    }

    static async getEspecialidadesById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
            SELECT me.matricula, e.nombre AS especialidades 
            FROM medico_especialidad me 
            LEFT JOIN especialidades e ON me.id_especialidad = e.id 
            WHERE me.id_medico = ?
          `, [id]);
            console.log(rows)
            return rows;
        } catch (error) {
            console.error('Error fetching especialidades:', error);
            throw new Error('Error al traer especialidades desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

}

module.exports = Especialidad;