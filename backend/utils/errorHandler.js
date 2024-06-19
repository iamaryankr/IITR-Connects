import ExpressError from "./ExpressError.js"

export const errorHandler = (cb) => (req, res, next) => {
    cb(req, res, next).catch((error) => {
        const e = new ExpressError(error.message, error.code || 500);
        console.log('in cb');
        next(e);
    });
}