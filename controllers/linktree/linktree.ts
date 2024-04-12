import { NextFunction, Request, Response } from "express";
import { redisGetAndParse } from "../common_method/utils.js";

// GET /events
export const getLinktrees = async (
    req: Request<any, any>,
    res: Response,
    next: NextFunction
) => {
    try {
        const major = req.params.major_advisor;
        if (!major) throw new Error('올바르지 않은 학과')
        const linktrees = await redisGetAndParse(`linktrees:${major}`);
        return res.status(200).json(linktrees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}