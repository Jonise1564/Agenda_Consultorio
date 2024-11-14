const express = require('express');
const EspecialidadesRouter = express.Router();
const especialidadesControllers = require('../controllers/EspecialidadesControllers');

EspecialidadesRouter.get('/', especialidadesControllers.getAll);

//Crear especialidad
EspecialidadesRouter.get('/create', especialidadesControllers.create);

//Guardar especialidad
EspecialidadesRouter.post('/store', especialidadesControllers.store);

// Editar especialidad
//EspecialidadesRouter.get('/editar/:id', especialidadesControllers.edit);
//EspecialidadesRouter.get('/editar', especialidadesControllers.edit);

//Vista editar
EspecialidadesRouter.get('/editar/:id', especialidadesControllers.edit);
//Actualizar especialidad
EspecialidadesRouter.post('/update/:id', especialidadesControllers.update);
//EspecialidadesRouter.post('/editar/:id', especialidadesControllers.update);

//Activar especialidad
EspecialidadesRouter.post('/activar/:id', especialidadesControllers.activate);

//Inactivar especialidad
EspecialidadesRouter.post('/inactivar/:id', especialidadesControllers.inactivate);


module.exports = EspecialidadesRouter;