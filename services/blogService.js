import { MongoClient, ObjectId } from 'mongodb';
import blogSchema from '../api/models/videoModel.js';
import dotenv from 'dotenv';

dotenv.config();  // Debe estar en la primera línea antes de cualquier importación

const client = new MongoClient(process.env.MONGO_URI);
const database = client.db('pruebas');
const blogsCollection = database.collection('blogs');

export async function uploadBlog(blogData) {
    const validatedBlogData = await blogSchema.validate(blogData);
    await client.connect();
    const result = await blogsCollection.insertOne(validatedBlogData);
    return result;
}

export async function getBlogById(blogId) {
    await client.connect();
    const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    return blog;
}

export async function getAllBlogs() {
    await client.connect();
    const blogs = await blogsCollection.find().toArray();
    return blogs;
}

export async function updateBlog(blogId, blogData) {
    const validatedBlogData = await blogSchema.validate(blogData);
    await client.connect();
    const result = await blogsCollection.updateOne(
        { _id: new ObjectId(blogId) },
        { $set: validatedBlogData }
    );
    return result;
}

export async function deleteBlog(blogId) {
    await client.connect();
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    return result;
}
