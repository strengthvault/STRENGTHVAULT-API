import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userSchema from '../api/models/userModel.js';

import dotenv from 'dotenv';
dotenv.config();  // Debe estar en la primera línea antes de cualquier importación

const client = new MongoClient(process.env.MONGO_URI);
const database = client.db('pruebas');
const usersCollection = database.collection('users');
const tokensCollection = database.collection('tokens');

// Obtener todos los usuarios
export async function getAllUsers() {
    await client.connect();

    const users = await usersCollection.find({ role: 'common' }).toArray();

    const updatedUsers = users.map(user => {
        if (user.futureDate) {
            const currentDate = new Date();
            const futureDate = new Date(user.futureDate);

            const timeDifference = futureDate - currentDate;
            const daysLeft = Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

            return {
                ...user,
                daysLeft
            };
        }

        return user;
    });

    return updatedUsers;
}

// Crear un nuevo usuario
export async function createUser(userData) {
    const validatedUserData = await userSchema.validate(userData);

    const hashedPassword = bcrypt.hashSync(validatedUserData.password, 8);
    validatedUserData.password = hashedPassword;

    await client.connect();
    const result = await usersCollection.insertOne(validatedUserData);
    return result;
}

// Iniciar sesión y generar un token
export async function loginUser(username, password) {
    await client.connect();
    const user = await usersCollection.findOne({ username });
    
    if (!user) throw new Error('User not found');

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    let isCaducate = false;
    if (user.futureDate) {
        const currentDate = new Date();
        const futureDate = new Date(user.futureDate);

        if (futureDate <= currentDate) {
            isCaducate = true;
        }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: 86400 // 24 hours
    });

    // Guardamos el token en la base de datos
    await tokensCollection.insertOne({ token, userId: user._id, createdAt: new Date() });

    return { 
        token, 
        user: {
            ...user, 
            isCaducate
        }
    };
}

// Cerrar sesión eliminando el token de la base de datos
export async function logoutUser(token) {
    console.log(token)
    await client.connect();

    // Asegurarnos de que el token sea un string y no un objeto circular
    if (typeof token !== 'string') {
        throw new Error('Token is not a valid string');
    }

    const result = await tokensCollection.deleteOne({ token });

    if (result.deletedCount === 0) {
        throw new Error('Token not found');
    }

    return { message: 'Logout exitoso' };
}


// Verificar el token en cada solicitud
export async function verifyToken(req, res, next) {
    const token = req.headers['auth-token'];
    if (!token) return res.status(401).json({ message: 'Acceso denegado' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        await client.connect();
        const tokenInDB = await tokensCollection.findOne({ token });

        if (!tokenInDB) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token no válido' });
    }
}

// Eliminar un usuario
export async function deleteUser(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new Error("El ID proporcionado no es válido");
    }

    await client.connect();

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
        throw new Error('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado correctamente' };
}

// Actualizar el acceso del usuario y el tiempo restante
export async function updateUserAccessAndTimeAlive(userId, userData) {
    const { futureDate, allowAllAccess } = userData;

    if (!ObjectId.isValid(userId)) {
        throw new Error("El ID proporcionado no es válido");
    }

    await client.connect();

    const targetDate = new Date(futureDate);
    const currentDate = new Date();

    const timeDifference = targetDate - currentDate;
    const timeAlive = Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

    const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) }, 
        { 
            $set: { 
                allowAllAccess: allowAllAccess, 
                futureDate: targetDate, 
                daysLeft: timeAlive 
            }
        },
        { returnDocument: 'after' }
    );

    if (!updatedUser) {
        throw new Error('Usuario no encontrado');
    }

    return updatedUser;
}
