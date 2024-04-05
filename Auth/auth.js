
import jwt from 'jsonwebtoken'


module.exports = async(req , res , next) => {
    const token = req.header('x-auth-token') || req.query.xAuthToken
    if(!token){
        //error
    }

    try {
        const decoded = jwt.verify(token , process.env.JWTSECRETKEY)
        
    } catch (error) {
        
    }
}