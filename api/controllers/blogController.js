import { uploadBlog, getBlogById, getAllBlogs, updateBlog, deleteBlog,  } from '../../services/blogService.js';
import { uploadToVimeo, checkVideoStatus } from '../../services/vimeoService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { getUserById } from '../../services/userService.js';

// Configuración de __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function uploadBlogController(req, res) {
    try {
        // Ruta al archivo de video
        //const videoPath = path.join(__dirname, './../../uploads', req.file.filename);

        // Subir video a Vimeo y agregar dominios a la whitelist
        /*const videoUri = await uploadToVimeo(videoPath, {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion
        });*/

        // Crear la URL de Vimeo

        //const videoUrl = `https://vimeo.com${videoUri}`; // Asumiendo que videoUri es algo como "/123456789"

        // Crear el blog con la URL del video en Vimeo
        const blog = await uploadBlog({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            jerarquia: req.body.jerarquia,
            url: '', // Guarda la URL de Vimeo
            fecha: new Date(),
            categoria: req.body.categoria,
            uploadedBy: req.userId
        });

        res.status(201).json({ ...blog/*, videoUrl*/ });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



export async function updateBlogController(req, res) {
    const userId = req.params.id
    try {


            // Ruta al archivo de video
            /*const videoPath = path.join(__dirname, './../../uploads', req.file.filename);

            // Subir video a Vimeo
            const videoUri = await uploadToVimeo(videoPath, {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion
            });

            // Crear la URL del nuevo video en Vimeo
            const videoUrl = `https://vimeo.com${videoUri}`; */
     

            const updatedBlogData = await updateBlog(userId, {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                jerarquia: req.body.jerarquia,
                fecha: new Date(),
                categoria: req.body.categoria,
            });

        // Construir los datos actualizados del blog

        // Actualizar el blog en la base de datos
        //const updatedBlog = await updateBlog(req.params.id, updatedBlogData);

        res.status(200).json(updatedBlogData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function getBlogByIdController(req, res) {
    const userId = req.params.userId
    const videoId = req.params.videoId

    try {
        // Obtenemos el blog a partir del ID
        const blog = await getBlogById(videoId);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        
        // Obtenemos el usuario actual usando el ID que dejamos en el middleware (por ejemplo, req.userId)
        const user = await getUserById(userId);
        if (!user) return res.status(401).json({ message: 'User not found' });
        
        // Convertimos el nivel de membresía del usuario a minúsculas
        const userLevel = user.category ? user.category.toLowerCase() : 'gratuito';
        console.log(userLevel)
        // Suponiendo que blog.jerarquia es un array, lo convertimos a minúsculas
        const blogLevels = blog.jerarquia.map(j => j.toLowerCase());
        console.log(blogLevels)
        // Definimos los niveles permitidos según el usuario:
        let allowedLevels = [];
        if (userLevel === 'elite') {
            allowedLevels = ['gratuito', 'basico', 'elite'];
        } else if (userLevel === 'basico') {
            allowedLevels = ['gratuito', 'basico'];
        } else {
            allowedLevels = ['gratuito'];
        }
        
        // Verificamos si el video tiene al menos un nivel permitido
        const isAllowed = blogLevels.some(level => allowedLevels.includes(level));
        console.log(isAllowed)

        
        res.status(200).json(blog);
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message });
    }
}

export async function getAllBlogsController(req, res) {
    try {
        const blogs = await getAllBlogs();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



export async function deleteBlogController(req, res) {
    try {
        const result = await deleteBlog(req.params.id);
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json({ message: 'Blog deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
