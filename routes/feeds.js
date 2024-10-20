import { Router } from 'express'
import { body } from 'express-validator'
import { getPosts, createPost, getPost, updatePost, deletePost } from '../controllers/feeds.js'

const router = Router()

const validationArray = [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5})
]

router.get('/posts', getPosts)
router.get('/post/:postId', getPost)
router.post('/post', validationArray, createPost)
router.put('/post/:postId', validationArray, updatePost)
router.delete('/post/:postId', deletePost)

export default router