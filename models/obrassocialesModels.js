const createConnection = require('../config/configDb');

class ObraSocial {
    // Mostrar todas las obras sociales
    static async getAll() {
        let conn;
        try {
            conn = await createConnection();
            const [obrasSociales] = await conn.query('SELECT id, nombre, descripcion, direccion, estado FROM obras_sociales');
            return obrasSociales;
        } catch (error) {
            console.error('Error fetching obras sociales:', error);
            throw new Error('Error al traer obras sociales desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // Crear una nueva obra social
    static async create({ nombre, descripcion, direccion }) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                INSERT INTO obras_sociales (nombre, descripcion, direccion)
                VALUES (?, ?, ?)
            `, [nombre, descripcion, direccion]);
            return result;
        } catch (error) {
            console.error('Error creating obra social:', error);
            throw new Error('Error al crear obra social');
        } finally {
            if (conn) conn.end();
        }
    }

    // Inactivar una obra social
    static async inactivate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE obras_sociales SET estado = 0 WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error inactivating obra social:', error);
            throw new Error('Error al inactivar obra social');
        } finally {
            if (conn) conn.end();
        }
    }

    // Activar una obra social
    static async activate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE obras_sociales SET estado = 1 WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error activating obra social:', error);
            throw new Error('Error al activar obra social');
        } finally {
            if (conn) conn.end();
        }
    }

    // Obtener una obra social por ID
    static async getObraSocialById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [obraSocial] = await conn.query('SELECT id, nombre, descripcion, direccion, estado FROM obras_sociales WHERE id = ?', [id]);
            return obraSocial;
        } catch (error) {
            console.error('Error fetching obra social:', error);
            throw new Error('Error al traer obra social desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // Actualizar una obra social
    static async updateObraSocial(id, { nombre, descripcion, direccion }) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('UPDATE obras_sociales SET nombre = ?, descripcion = ?, direccion = ? WHERE id = ?', [nombre, descripcion, direccion, id]);
            return result;
        } catch (error) {
            console.error('Error updating obra social:', error);
            throw new Error('Error al actualizar obra social');
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = ObraSocial;
