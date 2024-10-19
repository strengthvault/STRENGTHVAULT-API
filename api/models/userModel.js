import * as yup from 'yup';

const userSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().min(8).required(),
    role: yup.string().default('common')
});

export default userSchema;