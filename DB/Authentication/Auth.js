import jwt from "jsonwebtoken";

export default function isAuthenticated(req,res,next){
    try {
        const token = req.headers["token"];
        if(!token){
            return res.json({message : "Invalid Authorisation"})
        }
        jwt.verify(token,process.env.secret_key);
        next();
    } catch (error) {
        res.json({ message : error.message });
    }

}