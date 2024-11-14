const Especialidad = require('../models/especialidadesModels');

class EspecialidadesController {
    async getAll(req, res) {
        try {
            const especialidades = await Especialidad.getAll();

            const successMessage = req.query.success;
            res.render('especialidades/index', { especialidades, successMessage });
            //res.render('especialidades/index', { especialidades });

            //res.status(200).json(especialidades);
        } catch (error) {
            console.error('Error fetching especialidades:', error);
            res.status(500).json({ message: 'Error al traer especialidades' });
        }
    }

    // async create(req, res) {
    //     const { nombre } = req.body;
    //     try {
    //         const especialidad = await Especialidad.createNewEspecialidad(nombre);
    //         res.redirect('/especialidades');
    //     } catch (error) {
    //         console.error('Error creating especialidad:', error);
    //         res.status(500).json({ message: 'Error al crear especialidad' });
    //     }
    // }
    create(req, res) {
        res.render('especialidades/crear')
    }
    // async store(req, res) {
    //     const { nombre } = req.body;
    //     try {
    //         const especialidad = await Especialidad.createNewEspecialidad(nombre);
    //         res.redirect('/especialidades');
    //     } catch (error) {
    //         console.error('Error creating especialidad:', error);
    //         res.status(500).json({ message: 'Error al crear especialidad' });
    //     }
    // }
    async store(req, res) {
        const { nombre } = req.body;
        try {
            const especialidad = await Especialidad.createNewEspecialidad(nombre);
            // res.render('especialidades/index', {
            //     especialidad,
            //     successMessage: 'Especialidad agregada correctamente'
            // });
            res.redirect('/especialidades');
        } catch (error) {
            res.render('especialidades/crear', { errorMessage: error.message });
            // console.error('Error creating especialidad:', error);
            // res.status(500).json({ message: 'Error al crear especialidad' });
        }
    }

    async edit(req, res) {
        const { id } = req.params;
        console.log(`Controller: edit, Buscando especialidad con ID: ${id}`);
       try{
            const especialidad = await Especialidad.getEspecialidadById(id);
            if (!especialidad) {
                console.log('Especialidad no encontrada');
                return res.status(404).send('Especialidad no encontrada');
            }
            console.log('Controller: Especialidad encontrada:', especialidad);
            console.log('Enviando a especialidad a la vista editar...');
            res.render('especialidades/editar', { especialidad });
        } catch (error) {    
            console.error('Error al obtener especialidad:', error); 
            res.status(500).json({ message: 'Error al obtener especialidad' });          
        }
      

    }
    async update(req, res) { 
        const { id } = req.params;
        const { nombre } = req.body;
        try {
            const especialidad = await Especialidad.updateEspecialidad(id, nombre);
            res.redirect('/especialidades');
        } catch (error) {    
            console.error('Error updating especialidad:', error);
            res.status(500).json({ message: 'Error al actualizar especialidad' });
        }
    }

    async inactivate(req, res) {
        const { id } = req.params;
        try {
            const especialidad = await Especialidad.inactivate(id);
            res.redirect('/especialidades');
        } catch (error) {
            console.error('Error inactivating especialidad:', error);
            res.status(500).json({ message: 'Error al inactivar especialidad' });
        }
    }
    async activate(req, res) {
        const { id } = req.params;
        try {
            const especialidad = await Especialidad.activate(id);
            res.redirect('/especialidades');
        } catch (error) {
            console.error('Error activating especialidad:', error);
            res.status(500).json({ message: 'Error al activar especialidad' });
        }
    }


    async getEspecialidadesByMedico(req, res) {
        try {
            const especialidades = await Especialidad.findAll({ where: { medicoId: req.params.medicoId } });
            res.json(especialidades);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener las especialidades');
        }
    };

}
module.exports = new EspecialidadesController()

