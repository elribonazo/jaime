import httpStatus from 'http-status';

export default ({ env }) => {

    const handler = (err, _req, res, _next) => {
        const response = {
            code: err.status,
            message: err.message || httpStatus[err.status],
            errors: err.errors,
            stack: err.stack
        };

        if (env === "production") {
            delete response.stack;
        }
        console.log("error", response);
        res.status(err.status);
        res.json(response);
        res.end();
    }

    const notFound = (req, res, _next) => {
        return handler(new Error("Page not found"), req, res);
    };

    return {
        handler,
        notFound
    }
}