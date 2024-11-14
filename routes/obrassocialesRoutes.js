// routes/ObrasSocialesRouter.js
const express = require('express');
const ObrasSocialesRouter = express.Router();
const obrasSocialesControllers = require('../controllers/obrassocialesControllers');

ObrasSocialesRouter.get('/', obrasSocialesControllers.getAll);

// Crear obra social
ObrasSocialesRouter.get('/create', obrasSocialesControllers.create);

// Guardar obra social
ObrasSocialesRouter.post('/store', obrasSocialesControllers.store);

// Editar obra social
ObrasSocialesRouter.get('/editar/:id', obrasSocialesControllers.edit);

// Actualizar obra social
ObrasSocialesRouter.post('/update/:id', obrasSocialesControllers.update);

// Activar obra social
ObrasSocialesRouter.post('/activar/:id', obrasSocialesControllers.activate);

// Inactivar obra social
ObrasSocialesRouter.post('/inactivar/:id', obrasSocialesControllers.inactivate);

module.exports = ObrasSocialesRouter;
