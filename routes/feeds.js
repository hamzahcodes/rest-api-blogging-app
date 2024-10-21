import { Router } from 'express'
import { body } from 'express-validator'
import { getPosts, createPost, getPost, updatePost, deletePost, getStatus, setStatus } from '../controllers/feeds.js'
import verifyToken from '../middleware/isAuth.js'

const router = Router()

const validationArray = [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5})
]

router.get('/posts', verifyToken, getPosts)
router.get('/post/:postId',verifyToken, getPost)
router.post('/post', verifyToken, validationArray, createPost)
router.put('/post/:postId', verifyToken, validationArray, updatePost)
router.delete('/post/:postId', verifyToken, deletePost)

router.get('/status', verifyToken, getStatus)
router.post('/update-status', verifyToken, setStatus)


export default router