import cron from 'node-cron';
import { MongoClient } from 'mongodb';

// Configuración de MongoDB
const client = new MongoClient(process.env.MONGO_URI);
const database = client.db('pruebas');
const usersCollection = database.collection('users');

// Cron job que se ejecuta a diario a medianoche
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea programada...');

    try {
        await client.connect();
        const currentDate = new Date();

        // Encontrar usuarios donde la futureDate ya haya pasado
        const expiredUsers = await usersCollection.find({
            futureDate: { $lt: currentDate } // Usuarios con futureDate menor a la fecha actual
        }).toArray();

        for (const user of expiredUsers) {
            // Actualizar el estado del usuario
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { allowAllAccess: false, timeAlive: "Expirado" } }
            );
        }

        console.log('Usuarios expirados actualizados exitosamente');
    } catch (error) {
        console.error('Error al ejecutar el cron job:', error);
    }
});
