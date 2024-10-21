import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1]
    if(!token) {
        const error = new Error('Not Authenticated')
        error.statusCode = 401
        throw error 
    }
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'secret')
    } catch (error) {
        error.message = 'Token malformed'
        error.statusCode = 500
        throw error
    }

    if(!decodedToken) {
        const error = new Error('Not Authorized')
        error.statusCode = 403;
        throw error
    }
    req.userId = decodedToken.userId
    next()
}

export default verifyToken