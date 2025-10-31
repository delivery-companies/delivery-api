import type { NextFunction, Request, Response } from "express";

export const catchAsync = (
    // eslint-disable-next-line no-unused-vars
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
