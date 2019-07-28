import { resolve } from "path";



export const Route = (value) => {
    return function decorator(target, key) {
        target.method = value.method || 'get';
        target.url = value.url || '*';
        target.middlewares = value.middlewares || [];
        target.fetch = value.fetch || new Promise(async (resolve) => resolve());
    }
}