import * as yup from 'yup';

const blogSchema = yup.object().shape({
    nombre: yup.string().required(),
    descripcion: yup.string().required(),
    jerarquia: yup.string().required(),
    fecha: yup.date().default(() => new Date()),
    categoria: yup.string().required(),

});


export default blogSchema;
