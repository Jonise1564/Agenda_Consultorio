const express = require('express');
const router = express.Router();
const TurnosController = require('../controllers/turnosControllers');
const Turno = require('../models/turnosModels');

// Ruta para obtener todos los turnos
router.get('/:id', TurnosController.get);

// Ruta para reservar un turno
router.post('/reservar/:id', TurnosController.reservar)
// Ruta para bloquear un turno
router.post('/bloquear/:id', TurnosController.bloquear)
/*
router.post('/bloquear/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Lógica para bloquear el turno y actualizar el estado a "No disponible"
        const turnoActualizado = await Turno.update(id, { estado: 'No disponible' });

        if (turnoActualizado) {
            res.status(200).json({ message: 'Turno bloqueado exitosamente' });
        } else {
            res.status(400).json({ message: 'Error al bloquear el turno' });
        }
    } catch (error) {
        console.error('Error al bloquear el turno:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});*/

module.exports = router;
