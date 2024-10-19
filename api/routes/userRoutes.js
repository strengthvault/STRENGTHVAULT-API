// Elimina multer y la configuración del archivo
import express from 'express';
import { 
    register, 
    login, 
    getAllUsersController, 
    updateUserAccessController, 
    deleteUserController 
} from '../controllers/userController.js';
import { getOEmbed } from '../controllers/vimeoController.js';

import { 
    uploadBlogController, 
    getBlogByIdController, 
    getAllBlogsController, 
    updateBlogController, 
    deleteBlogController 
} from './../controllers/blogController.js';

const router = express.Router();

router.post('/api/users/register', register);
router.post('/api/login', login);

router.get('/api/users', getAllUsersController);

// Elimina multer de las rutas de subida
router.post('/api/blogs/upload', uploadBlogController); // Sin multer
router.get('/api/blogs/:id', getBlogByIdController);
router.get('/api/blogs', getAllBlogsController);
router.put('/api/blogs/:id', updateBlogController); // Sin multer
router.delete('/api/blogs/:id', deleteBlogController);
router.delete('/api/users/:userId', deleteUserController);
router.post('/api/oembed', getOEmbed);

router.put('/api/users/:userId/access', updateUserAccessController);

export default router;
