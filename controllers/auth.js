import { validationResult } from "express-validator";
import bcrypt from 'bcryptjs'
import User from "../models/user.js";

export const signup = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422;
        error.data = errors.array()
        throw error
    }

    const { email, password, name } = req.body;
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                name: name
            })
            return user.save()
        })  
        .then(result => {
            res.status(201).json({ message: 'User created successfully', userId: result._id })
        })
        .catch(err => {
            next(err)
        })
}

export const login = (req, res, next) => {
    const { email, password } = req.body

    let loadedUser
    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('User with email does not exist')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then((isEqual) => {
            if(!isEqual) {
                const error = new Error('Wrong Password')
                error.statusCode = 401
                throw error
            }
            
        })
        .catch(err => {
            next(err)
        })
}