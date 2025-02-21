import * as yup from 'yup';

const userSchema = yup.object().shape({
  username: yup.string(),
  email: yup.string(),
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es obligatoria"),
  role: yup.string().default('common')
}).test('user-email-required', null, function(value) {
  const { username, email } = value || {};
  // Si ambos están vacíos, retornar un único error combinado
  if (!username && !email) {
    return this.createError({
      message: 'El email y el usuario son obligatorios',
      path: 'username'
    });
  }
  // Si solo falta username, se retorna su error
  if (!username) {
    return this.createError({
      message: 'El usuario es un campo requerido',
      path: 'username'
    });
  }
  // Si solo falta email, se retorna su error
  if (!email) {
    return this.createError({
      message: 'El email es un campo requerido',
      path: 'email'
    });
  }
  // Validar formato de email
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return this.createError({
      message: 'Debe ser un email válido',
      path: 'email'
    });
  }
  return true;
});

export default userSchema;
