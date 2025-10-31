export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    code!: string;
    override message: string;

    constructor(message: string, statusCode: number) {
        super();

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        this.message = message;
        // this.code = 0;

        Error.captureStackTrace(this, this.constructor);
    }
}
