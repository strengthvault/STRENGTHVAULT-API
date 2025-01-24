import { createUser, loginUser, getAllUsers, updateUserAccessAndTimeAlive,  logoutUser, deleteUser, getUserById } from './../../services/userService.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from './../../services/emailService.js';

export async function getAllUsersController(req, res) {
    try {
        const users = await getAllUsers();
        res.status(201).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function getUserIdController(req, res) {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'user not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function register(req, res) {
    try {
      const user = await createUser(req.body);
      console.log(user);
  
      // Enviar correo de bienvenida (si quieres mantenerlo)
      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: '¡Bienvenido a la plataforma!',
          text: `Hola, ${user.username}.\n\n¡Gracias por registrarte! Esperamos que disfrutes nuestros servicios.\n\nSaludos.`,
        });
      }
  
      // === Generar token JWT ===
      // user.role podría ser 'common' si no se define.
      const token = jwt.sign(
        { id: user._id, role: user.role || 'common' },
        process.env.JWT_SECRET,
        { expiresIn: 86400 }
      );
  
      // Retornar user y token
      res.status(201).json({ user, token });
    } catch (error) {
        // Mensaje de error claro
        res.status(400).json({ message: error.message });
      }
  }

export async function login(req, res) {
    try {
        const { username, password } = req.body;
        const { token, user } = await loginUser(username, password);

        // Verificar si el usuario tiene una fecha futura asignada
        if (user.futureDate) {
            const currentDate = new Date();
            const futureDate = new Date(user.futureDate);

            // Si la fecha futura es menor o igual a la actual, se marca como caducado
            if (futureDate <= currentDate) {
                user.isCaducate = true;
            } else {
                user.isCaducate = false;
            }
        }

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}


export async function logout(req, res) {
    try {
        const token = req.headers['auth-token'];

        // Asegurarnos de que el token esté presente y sea válido
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        const result = await logoutUser(token);
        

        res.status(200).json(result);
        console.log(result)
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: error.message });
    }
}


export async function deleteUserController(req, res) {
    try {
        const { userId } = req.params;

        const result = await deleteUser(userId);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}




export async function updateUserAccessController(req, res) {
    try {
        const { userId } = req.params;
        const { futureDate, allowAllAccess, paymentHistory, selectedMonth, category } = req.body;

        if (!futureDate || allowAllAccess === undefined) {
            return res.status(400).json({ message: "Se requieren la fecha futura y el valor de allowAllAccess" });
        }

        const updatedUser = await updateUserAccessAndTimeAlive(userId, { 
            futureDate, 
            allowAllAccess, 
            paymentHistory, 
            selectedMonth, 
            category 
        });

        // === LÓGICA DE ENVÍO DE CORREO ===
        // Suponiendo que 'updatedUser.value' es el doc final con email, etc.
        // Ajusta según tu version de findOneAndUpdate.
        
        const finalUser = updatedUser.value || updatedUser; 
        // updatedUser puede ser un objeto { ok, value, ... }
        // Si usas { returnDocument: 'after' }, la info suele estar en updatedUser.value.
        
        if (finalUser && finalUser.email) {
          // Envía correo
          await sendEmail({
            to: finalUser.email,
            subject: 'Tu membresía ha sido actualizada',
            text: `Hola, ${finalUser.username}. Tu membresía ahora es: ${finalUser.category}. ¡Gracias!`
            // Podrías también usar HTML si prefieres:
            // html: `<h1>Hola, ${finalUser.username}</h1><p>Tu membresía es ahora: ${finalUser.category}.</p>`
          });
        }

        res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
