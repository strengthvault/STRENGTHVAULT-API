import { uploadBlog, getBlogById, getAllBlogs, updateBlog, deleteBlog,  } from '../../services/blogService.js';
import { uploadToVimeo, checkVideoStatus } from '../../services/vimeoService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

// Configuración de __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function uploadBlogController(req, res) {
    try {
        console.log('Archivo recibido:', req.file, req.body);
        // Asegúrate de que el archivo de video esté disponible
        if (!req.file) {
            return res.status(400).json({ message: 'Archivo de video es requerido' });
        }
   
        // Ruta al archivo de video usando el archivo subido por Multer
        const videoPath = path.join(__dirname, './../../uploads', req.file.filename);
   
        // Sube el video a Vimeo y establece dominios en la whitelist
        const videoUri = await uploadToVimeo(videoPath, {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion
        });

        // Extrae solo el ID del video de Vimeo
        const videoId = videoUri.split('/').pop();
   
        // Crea el blog en la base de datos con la URL del video en Vimeo
        const blog = await uploadBlog({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            url: `https://vimeo.com/${videoId}`,
            fecha: new Date(),
            categoria: req.body.categoria,
            uploadedBy: req.userId
        });
   
        res.status(201).json({ ...blog, videoUrl: `https://vimeo.com/${videoId}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export async function updateBlogController(req, res) {
    try {
        const userId = req.params.id;
   
        // Verificar si hay un archivo de video para actualizar en Vimeo
        let videoUrl;
        if (req.file) {
            const videoPath = path.join(__dirname, './../../uploads', req.file.filename);
            const videoUri = await uploadToVimeo(videoPath, {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion
            });
            videoUrl = `https://vimeo.com${videoUri}`;
        }
   
        const updatedBlogData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            url: videoUrl || undefined, // Solo actualizar si hay nuevo video
            fecha: new Date(),
            categoria: req.body.categoria,
        };
   
        const updatedBlog = await updateBlog(userId, updatedBlogData);
        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export async function getBlogByIdController(req, res) {
    try {
        const blog = await getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function getAllBlogsController(req, res) {
    try {
        const blogs = await getAllBlogs();

        // Verifica el estado de cada video
        const blogsWithStatus = await Promise.all(blogs.map(async (blog) => {
            const videoId = blog.url.split('/').pop();  // Extraer el ID del video desde la URL de Vimeo
            const status = await checkVideoStatus(videoId);
            return {
                ...blog,
                videoStatus: status
            };
        }));

        res.status(200).json(blogsWithStatus);
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
