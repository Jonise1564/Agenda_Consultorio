
const express = require('express');
const TurnosRouter = express.Router()
const TurnosControllers = require('../controllers/turnosControllers');

// Index turnos desde agenda por el idagenda
TurnosRouter.get('/:id', TurnosControllers.get);
/*
// Vista crear (GET para mostrar el formulario)
TurnosRouter.get('/create', TurnosControllers.getCreateForm);

// redirigir a la vista crear
TurnosRouter.get('/create', TurnosControllers.create);

// Guardar nuevo médico (POST para la ruta raíz, si es necesario)
TurnosRouter.post('/', TurnosControllers.store);

// Vista editar
TurnosRouter.get('/edit/:dni', TurnosControllers.edit);

// Actualizar médico
TurnosRouter.post('/update/:dni', TurnosControllers.update);

// Eliminar médico
TurnosRouter.post('/activar/:dni', TurnosControllers.activar)
//inactivar
TurnosRouter.post('/inactivar/:dni', TurnosControllers.inactivar);

*/
module.exports = TurnosRouter;
