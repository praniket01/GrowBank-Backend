import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken'

export const authMiddleware = async (req,res,next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if(!token){
        return res.status(401).json({
            message : "Unauthorization access, token is missing"
        });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decode.userId);

        req.user = user;

        return next();
    } catch (error) {
        return res.status(401).json({
            message : "Unauthorized access, token is invalid"
        })
    }
    
}