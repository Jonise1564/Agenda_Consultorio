const ObraSocial = require('../models/obrassocialesModels');

class ObrasSocialesController {
    async getAll(req, res) {
        try {
            const obrasSociales = await ObraSocial.getAll();
            const successMessage = req.query.success;
            res.render('obrasSociales/index', { obrasSociales, successMessage });
        } catch (error) {
            console.error('Error fetching obras sociales:', error);
            res.status(500).json({ message: 'Error al traer obras sociales' });
        }
    }

    create(req, res) {
        res.render('obrasSociales/crear');
    }

    async store(req, res) {
        const { nombre, descripcion, direccion } = req.body;
        try {
            const obraSocial = await ObraSocial.create({ nombre, descripcion, direccion, estado: 1 });
            res.redirect('/obrasSociales');
        } catch (error) {
            res.render('obrasSociales/crear', { errorMessage: error.message });
        }
    }

    async edit(req, res) {
        const { id } = req.params;
        try {
            const obraSocial = await ObraSocial.getObraSocialById(id);
            if (!obraSocial) {
                return res.status(404).send('Obra social no encontrada');
            }
            res.render('obrasSociales/editar', { obraSocial });
        } catch (error) {
            console.error('Error al obtener obra social:', error);
            res.status(500).json({ message: 'Error al obtener obra social' });
        }
    }

    async update(req, res) {
        const { id } = req.params;
        const { nombre, descripcion, direccion } = req.body;
        try {
            const obraSocial = await ObraSocial.updateObraSocial(id, { nombre, descripcion, direccion });
            res.redirect('/obrasSociales');
        } catch (error) {
            console.error('Error updating obra social:', error);
            res.status(500).json({ message: 'Error al actualizar obra social' });
        }
    }

    async inactivate(req, res) {
        const { id } = req.params;
        try {
            const obraSocial = await ObraSocial.inactivate(id);
            res.redirect('/obrasSociales');
        } catch (error) {
            console.error('Error inactivating obra social:', error);
            res.status(500).json({ message: 'Error al inactivar obra social' });
        }
    }

    async activate(req, res) {
        const { id } = req.params;
        try {
            const obraSocial = await ObraSocial.activate(id);
            res.redirect('/obrasSociales');
        } catch (error) {
            console.error('Error activating obra social:', error);
            res.status(500).json({ message: 'Error al activar obra social' });
        }
    }
}

module.exports = new ObrasSocialesController();
