import jwt from 'jsonwebtoken';

const authenticateJWT = (req) => {
    // Use .get() method if req.headers is a HeadersList, else fallback to object-like access
    console.log(req.headers)
    const authHeader = req.headers.get ? req.headers.get('authorization') : req.headers['authorization'];
    
    if (!authHeader) {
        console.log("Authorization header not found");
        return { error: 'Access denied.' }; // Return error as an object
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return { error: 'Access denied.' }; // Return error if token is not present
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return user; // Return the user object if token is valid
    } catch (err) {
        return { error: 'Invalid token.' }; // Return error if token is invalid
    }
};

export default authenticateJWT;
