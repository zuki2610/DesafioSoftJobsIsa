require("dotenv").config();
const jwt = require('jsonwebtoken');

const get_Users_Middleware = (req, res, next) => {
    try {
        const Authorization = req.header("Authorization");
        if(!Authorization) {
            return res.status(401).json( {message: 'No se encuentra el token'} );
        }
        const token = Authorization.split("Bearer ")[1];
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        req.data = verifyToken;
        console.log('Token verificado');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = {get_Users_Middleware};