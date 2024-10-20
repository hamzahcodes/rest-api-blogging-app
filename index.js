import express from 'express'
import bodyParser from 'body-parser'
import feedRoutes from './routes/feeds.js'
import authRoutes from './routes/auth.js'
import mongoose from 'mongoose'
import path from 'path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid';

const app = express()
const __dirname = path.resolve();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
    next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message
    const data = error.data
    res.status(status).json({ message: message, data: data })
})

mongoose.connect('mongodb://localhost:27017/messages', { family: 4 })
    .then(result => app.listen(8000, () => console.log(`Server listening at port 8000`)))
    .catch(err => console.log(err))