import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userSchema from '../api/models/userModel.js';

import dotenv from 'dotenv';
dotenv.config();  // Debe estar en la primera línea antes de cualquier importación

const client = new MongoClient(process.env.MONGO_URI);
const database = client.db('pruebas');
const usersCollection = database.collection('users');

export async function getAllUsers() {
    await client.connect();

    const users = await usersCollection.find({ role: 'common' }).toArray();

    // Iterar sobre cada usuario y calcular `daysLeft` si tiene `futureDate`
    const updatedUsers = users.map(user => {
        if (user.futureDate) {
            const currentDate = new Date();
            const futureDate = new Date(user.futureDate);

            // Calcular la diferencia en días entre la fecha actual y la `futureDate`
            const timeDifference = futureDate - currentDate;
            const daysLeft = Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24))); // Convertir a días

            // Actualizar el valor de `daysLeft` en el usuario
            return {
                ...user,
                daysLeft
            };
        }

        // Si no tiene `futureDate`, simplemente retornamos el usuario sin cambios
        return user;
    });

    return updatedUsers;
}

export async function createUser(userData) {
    // Validamos los datos con yup
    const validatedUserData = await userSchema.validate(userData);

    // Encriptamos la contraseña
    const hashedPassword = bcrypt.hashSync(validatedUserData.password, 8);
    validatedUserData.password = hashedPassword;

    // Insertamos el usuario en la base de datos
    await client.connect();
    const result = await usersCollection.insertOne(validatedUserData);
    return result; // Devuelve el usuario recién creado
}


export async function loginUser(username, password) {
    console.log(username, password);
    await client.connect();
    const user = await usersCollection.findOne({ username });
    
    if (!user) throw new Error('User not found');

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    // Verificamos si el usuario tiene una `futureDate` y si está caducada
    let isCaducate = false;
    if (user.futureDate) {
        const currentDate = new Date();
        const futureDate = new Date(user.futureDate);

        // Si la fecha futura es menor o igual a la actual, el acceso ha caducado
        if (futureDate <= currentDate) {
            isCaducate = true;
        }
    }

    // Incluimos el valor de isCaducate en la respuesta del usuario
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: 86400 // 24 hours
    });

    // Devolvemos el token y el usuario con la propiedad isCaducate
    return { 
        token, 
        user: {
            ...user, 
            isCaducate // Añadimos la propiedad isCaducate
        }
    };
}


export async function deleteUser(userId) {
    // Verificar si el userId es válido
    if (!ObjectId.isValid(userId)) {
        throw new Error("El ID proporcionado no es válido");
    }

    // Nos conectamos a la base de datos
    await client.connect();

    // Intentamos eliminar el usuario de la base de datos
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
        throw new Error('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado correctamente' };
}



export async function updateUserAccessAndTimeAlive(userId, userData) {
    const { futureDate, allowAllAccess } = userData;

    // Verificar si el userId es válido
    if (!ObjectId.isValid(userId)) {
        throw new Error("El ID proporcionado no es válido");
    }

    // Nos conectamos a la base de datos
    await client.connect();

    // Convertimos la fecha ingresada en un objeto Date
    const targetDate = new Date(futureDate);
    const currentDate = new Date();

    // Calcular la diferencia de tiempo entre la fecha actual y la fecha futura
    const timeDifference = targetDate - currentDate;
    const timeAlive = Math.max(0, Math.floor(timeDifference / (1000 * 60 * 60 * 24))); // Convertir a días

    // Actualizamos el usuario en la base de datos
    const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) }, 
        { 
            $set: { 
                allowAllAccess: allowAllAccess, 
                futureDate: targetDate, // Guardar la fecha ingresada
                daysLeft: timeAlive // Guardar los días restantes calculados
            }
        },
        { returnDocument: 'after' } // Retorna el documento actualizado
    );

    if (!updatedUser) {
        throw new Error('Usuario no encontrado');
    }

    return updatedUser; // Devolvemos el usuario actualizado
}
