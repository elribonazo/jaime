import fs from 'fs';

export default (config) => {

    const routing = {
        build: () => {
            if (!config.server.middlewares || config.server.middlewares.length <= 0) {
                throw new Error("Invalid configuration middlwares.");
            }
            return config.server.middlewares;
        }
    }

    return routing;
}