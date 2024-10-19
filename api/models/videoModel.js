import * as yup from 'yup';

const blogSchema = yup.object().shape({
    nombre: yup.string().required(),
    descripcion: yup.string().required(),
    fecha: yup.date().default(() => new Date()),
    categoria: yup.string().required(),
    video: yup.string().url().optional()  // Hacer que la URL sea opcional
});


export default blogSchema;
