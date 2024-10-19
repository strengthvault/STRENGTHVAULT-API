import { Vimeo } from 'vimeo';
import dotenv from 'dotenv';
dotenv.config();

const client = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);

export async function whitelistDomains(videoId, domains) {
    return new Promise((resolve, reject) => {
        client.request({
            method: 'PATCH',
            path: `/videos/${videoId}`,
            query: {
                'privacy.embed': 'whitelist',
                'privacy.whitelist': domains // Agrega los dominios permitidos
            }
        }, function (error, body, status_code, headers) {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}


export async function uploadToVimeo(videoPath, videoData) {
    console.log('Vimeo Client ID:', process.env.VIMEO_CLIENT_ID);
    console.log('Vimeo Client Secret:', process.env.VIMEO_CLIENT_SECRET);
    console.log('Vimeo Access Token:', process.env.VIMEO_ACCESS_TOKEN);

    return new Promise((resolve, reject) => {
        client.upload(
            videoPath,
            {
                name: videoData.nombre,
                description: videoData.descripcion,
                privacy: {
                    view: 'disable', // Deshabilita la visualización pública
                    embed: 'whitelist', // Solo permitir incrustación en dominios específicos
                    download: false // Deshabilita la descarga del video
                },
                embed: {
                    buttons: {
                        like: false, // Deshabilita el botón de "me gusta"
                        share: false, // Deshabilita el botón de compartir
                        watchlater: false, // Deshabilita el botón de "ver más tarde"
                        embed: false // Deshabilita la opción de incrustar el video
                    },
                    logos: {
                        vimeo: false // Oculta el logo de Vimeo en el reproductor
                    }
                }
            },
            async function (uri) {
                console.log('Your video URI is: ' + uri);
                
                // Extraer el ID del video
                const videoId = uri.split('/').pop();

                // Agregar dominios a la whitelist
                const domains = ['yourdomain.com', 'localhost:3000.com']; // Reemplaza con tus dominios
                await whitelistDomains(videoId, domains);

                resolve(uri); // Devuelve la URI del video
            },
            function (bytesUploaded, bytesTotal) {
                const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                console.log(bytesUploaded, bytesTotal, percentage + '%');
            },
            function (error) {
                console.log('Failed because: ' + error);
                reject(error);
            }
        );
    });
}


export async function checkVideoStatus(videoId) {
    return new Promise((resolve, reject) => {
        client.request({
            method: 'GET',
            path: `/videos/${videoId}`
        }, function (error, body, status_code, headers) {
            if (error) {
                reject(error);
            } else {
                resolve(body.status);  // 'available', 'uploading', 'transcoding', etc.
            }
        });
    });
}