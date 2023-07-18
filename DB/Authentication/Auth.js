import jwt from "jsonwebtoken";

export default function isAuthenticated(req,res,next){
    const token = req.headers["token"];
    if(!token){
        return res.json({message : "Invalid Authorisation"})
    }
    jwt.verify(token,process.env.secret_key);
    next();
}