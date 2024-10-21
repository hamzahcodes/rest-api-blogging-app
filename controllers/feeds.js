import { validationResult } from 'express-validator'
import path from 'path'
import fs from 'fs'
import Post from '../models/post.js'
import User from '../models/user.js'

const clearImage = (filePath) => {
    console.log(filePath);
    const __dirname = path.resolve();
    filePath = path.join(__dirname, '..', filePath)
    console.log(filePath);
    fs.unlink(filePath, (err) => { 
        console.log(err.path)
        console.log(err.path === filePath);
    })
}

export const getPosts = (req, res, next) => {
    const { page } = req.query;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
                return Post.find().skip((page - 1) * perPage).limit(perPage)
        })
        .then(result => {
            if(!result) {
                const error = new Error('Could not find posts!')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({ posts : result, totalItems: totalItems })
        })
        .catch(err => {
            next(err)
        })
}

export const getPost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
    .then(result => {
        if(!result) {
            const error = new Error('Could not find post with given Id!')
            error.statusCode = 404
            throw error
        }   
        res.status(200).json({ post: result })
    })
    .catch(err => {
        next(err)
    })
}

export function createPost(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        throw error
    }
    if(!req.file) {
        const error = new Error('Image file is not provided')
        error.statusCode = 422
        throw error
    }

    const imageUrl = req.file.path.replace(/\\/g, '/')
    const newPost = new Post({
        title: req.body.title,
        imageUrl: imageUrl,
        content: req.body.content,
        creator: req.userId
    })
    
    newPost
    .save()
    .then(result => {
        return User.findById(req.userId)  
    })
    .then(user => {
        user.posts.push(newPost)
        return user.save()
    })
    .then(result => {
        res.status(201).json({
            message: 'Post created successfully',
            post: newPost,
            creator: { _id: result._id, name: result.name }
        })
    })
    .catch(err => {
        next(err)
    })
}

export const updatePost = (req, res, next) => {
    const { postId } = req.params;
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        throw error
    }
    const { title, content, image } = req.body;

    let imageUrl = image
    if(req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/')
    }
    if(!imageUrl) {
        const error = new Error('No image provided')
        error.statusCode = 422
        throw error
    }

    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Post with given Id not found')
                error.statusCode = 404
                throw error
            }

            if(post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

            if(imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }

            post.title = title
            post.content = content
            post.imageUrl = imageUrl
            post.save()
                .then(updatedPost => {
                    res.status(200).json({ message: 'Post updated successfully', post: updatedPost })
                })
                .catch(err => {
                    next(err)
                })
        })
        .catch(err => {
            next(err)
        })
}

export const deletePost = (req, res, next) => {
    const { postId } = req.params;
    console.log(postId);
    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('No post with given id found')
                error.statusCode = 404
                throw error
            }
            
            if(post.creator.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

            clearImage(post.imageUrl)
            Post.findByIdAndDelete(postId)
                .then(result => {
                    return User.findById(req.userId)
                })
                .then(user => {
                    user.posts.pull(postId)
                    return user.save()
                })
                .then(result => {
                    res.status(200).json({ message: 'Post deleted successfully'})
                })
                .catch(err => {
                    next(err)
                })
        })
        .catch(err => {
            next(err)
        })
}

export const getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            return res.status(200).json({ status: user.status })
        })
}

export const setStatus = (req, res, next) => {
    const { status } = req.body
    User.findById(req.userId)
        .then(user => {
            user.status = status
            return user.save()
        })
        .then(result => {
            res.status(201).json({ message: 'Status updated successfully'})
        })
        .catch(err => {
            next(err)
        })
}