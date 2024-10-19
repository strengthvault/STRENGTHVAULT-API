import express from 'express';
import { register, login, getAllUsersController, updateUserAccessController, deleteUserController } from '../controllers/userController.js';
import { getOEmbed } from '../controllers/vimeoController.js';

import { 
    uploadBlogController, 
    getBlogByIdController, 
    getAllBlogsController, 
    updateBlogController, 
    deleteBlogController 
} from './../controllers/blogController.js';


import { verifyToken } from './../middlewares/authMiddleware.js';
import multer from 'multer';
import upload from '../multer/multerConfig.js';

const router = express.Router();

router.post('/api/users/register', register);
router.post('/api/login', login);

router.get('/api/users', getAllUsersController);
router.post('/api/blogs/upload', upload.single('video'), uploadBlogController);
router.get('/api/blogs/:id', getBlogByIdController);
router.get('/api/blogs', getAllBlogsController);
router.put('/api/blogs/:id',upload.single('video'), updateBlogController);
router.delete('/api/blogs/:id', deleteBlogController);
router.delete('/api/users/:userId', deleteUserController);
router.post('/api/oembed', getOEmbed);


router.put('/api/users/:userId/access', updateUserAccessController);

export default router;