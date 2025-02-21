import * as yup from 'yup';

const blogSchema = yup.object().shape({
    nombre: yup.string().required(),
    descripcion: yup.string().required(),
    jerarquia: yup.array().required(),
    fecha: yup.date().default(() => new Date()),
    categoria: yup.array().required(),

});


export default blogSchema;
