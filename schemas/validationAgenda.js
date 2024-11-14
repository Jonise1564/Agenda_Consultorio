const { z } = require('zod');

// matricula, id_sucursal, id_clasificacion 
const AgendaSchema = z.object({
    fecha_creacion: z.date({
        invalid_type_error: 'La fecha de creacion debe ser un tipo date',
        required_error: 'La fecha de creacion es obligatoria'
    }).refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de creacion inválida"
    }),
    fecha_fin: z.date({
        invalid_type_error: 'La fecha de fin debe ser un tipo date',
        required_error: 'La fecha de fin es obligatoria'
    }).refine((date) => !isNaN(Date.parse(date)), {
        message: "Fecha de fin inválida"
    }),
    hora_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    hora_fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    limite_sobreturnos: z.string({
        invalid_type_error: 'El limite de sobreturnos debe ser un número',
        required_error: 'El limite de sobreturnos es obligatorio'
    }).regex(/^\d+$/, { message: "El limite de sobreturnos debe ser un número" }),
    duracion_turnos: z.string({
        invalid_type_error: 'La duracion debe ser un número',
        required_error: 'La duracion es obligatorio'
    }).regex(/^\d+$/, { message: "La duracion debe ser un número" }),
    nromatricula: z.string({
        invalid_type_error: 'La matricula debe ser un número',
        required_error: 'La matricula es obligatorio'
    }).regex(/^\d+$/, { message: "La matricula debe ser un número" }),
    id_sucursal: z.string({
        invalid_type_error: 'la sucursal debe ser un número',
        required_error: 'la sucursal es obligatorio'
    }).regex(/^\d+$/, { message: "Seleccionar sucursal correcta" }),
    id_clasificacion: z.string({
        invalid_type_error: 'la clasificación debe ser un número',
        required_error: 'la clasificación es obligatorio'
    }).regex(/^\d+$/, { message: "Seleccionar clasificación correcta" }),
})

const validateAgendas = (input) => {
    const result = AgendaSchema.safeParse(input);
    if (!result.success) {
        return result;
    }

    // Transformar los datos validados a los tipos correctos
    const data = result.data;
    return {
        success: true,
        data: {
            fecha_creacion: new Date(data.fecha_creacion),
            fecha_fin: new Date(data.fecha_fin),
            hora_inicio: data.hora_inicio,
            hora_fin: data.hora_fin,
            limite_sobreturnos: parseInt(data.limite_sobreturnos, 10),
            duracion_turnos: parseInt(data.duracion_turnos, 10),
            nromatricula: parseInt(data.nromatricula, 10),
            id_sucursal: parseInt(data.id_sucursal, 10),
            id_clasificacion: parseInt(data.id_clasificacion, 10),
        }
    };
};

const AgendasValidationSchema = z.object({
    fecha_creacion: z.date().optional(),
    fecha_fin: z.date().optional(),
    hora_inicio: z.string().optional(),
    hora_fin: z.string().optional(),
    limite_sobreturnos: z.string().optional(),
    duracion_turnos: z.string().optional(),
    nromatricula: z.string().optional(),
    id_sucursal: z.string().optional(),
    id_clasificacion: z.string().optional()

})

const validatePartialAgendas = (input) => {
    return AgendasValidationSchema.safeParse(input);
};




module.exports = { validateAgendas, validatePartialAgendas };

