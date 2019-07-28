import bodyParser from 'body-parser';
import path from 'path';
import passport from 'passport';
import cookieparser from 'cookie-parser';
import expressSanitizer from 'express-sanitizer';

import cors from 'Core/cors';

const defaultApplicationDomain = process.env.DOMAIN || 'localhost';
const defaultApplicationPort = process.env.PORT || 3002;
const defaultApplicationProtocol = process.env.PROTOCOL || 'http';
const defaultApplicationEnvironment = process.env.NODE_ENV || 'local';

const config = {
    env: defaultApplicationEnvironment,
    server: {
        autoloadControllers: true,
        autoloadModels: true,
        autoloadMiddlewares: true,
        protocol: defaultApplicationProtocol,
        domain: defaultApplicationDomain,
        port: defaultApplicationPort,
        middlewares: [
            cookieparser(),
            bodyParser.json(),
            bodyParser.urlencoded({ extended: false }),
            cors(defaultApplicationProtocol, defaultApplicationDomain, defaultApplicationPort),
            passport.initialize(),
            expressSanitizer()
        ],
        paths: {
            routesPath: path.join(process.cwd(), 'src/api/controllers'),
            modelsPath: path.join(process.cwd(), 'src/api/models'),
            templatesPath: path.join(process.cwd(), 'src/templates'),
            cronsPath: path.join(process.cwd(), 'src/crons'),
            importPath: path.join(process.cwd(), 'import'),
            translationsPath: path.join(process.cwd(), 'config/languages')
        }
    }
}

export default config;