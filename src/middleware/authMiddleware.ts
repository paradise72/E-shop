import {NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({error: 'Auth token required'})
        }

        const token = authHeader.split(' ')[1]
        if(!token){
            return res.status(401).json({error: 'Invalid Auth'})
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next()
    }catch (e){
        return res.status(401).json({error: 'Invalid or expired token'})
    }
}