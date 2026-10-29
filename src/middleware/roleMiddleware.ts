import express from "express";
import jwt from "jsonwebtoken";

export const authorize = (...roles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // If authenticate middleware wasn't run prior, attempt to decode token from Authorization header
        if (!(req as any).user && req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(" ")[1];
                if (token) {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
                    (req as any).user = decoded;
                }
            } catch (err) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }
        }

        if (!(req as any).user) {
            return res.status(401).json({ error: "You are not authenticated" });
        }

        if (!roles.includes((req as any).user.role)) {
            return res.status(403).json({ error: "You are not authorized" });
        }

        next();
    };
};