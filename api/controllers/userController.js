import { createUser, loginUser, getAllUsers, updateUserAccessAndTimeAlive,  logoutUser, deleteUser } from './../../services/userService.js';

export async function getAllUsersController(req, res) {
    try {
        const users = await getAllUsers();
        res.status(201).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function register(req, res) {
    try {
        const user = await createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
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
        const { futureDate, allowAllAccess } = req.body;

        if (!futureDate || allowAllAccess === undefined) {
            return res.status(400).json({ message: "Se requieren la fecha futura y el valor de allowAllAccess" });
        }

        const updatedUser = await updateUserAccessAndTimeAlive(userId, { futureDate, allowAllAccess });

        res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

