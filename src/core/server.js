import express from 'express';
import http from 'http';
import passport from 'passport';
import { createWindow } from 'domino';

import Middleware from 'Core/middleware';
import Err from 'Core/error';

import * as Controllers from 'Api/controllers';

export class Server {

    constructor(config) {
        this.hooks = {};
        this.config = config;
    }

    async enableDocument(template) {
        const win = createWindow(template);
        Object.defineProperty(win.document.body.style, 'transform', { value: () => ({ enumerable: true, configurable: true }) });
        global['window'] = win;
        global['CSS'] = null;
        global['Prism'] = null;
        global['document'] = win.document;
        global['DOMTokenList'] = win.DOMTokenList;
        global['Node'] = win.Node;
        global['Text'] = win.Text;
        global['HTMLElement'] = win.HTMLElement;
        global['HTMLUnknownElement'] = win.HTMLUnknownElement;
        global['navigator'] = win.navigator;
    }

    async setAuthenticationMiddleware(auth) {
        try {
            this.auth = auth;
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    async setHook(name, func) {
        try {
            this.hooks[name] = func;
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    async start() {
        try {
            const error = Err(this.config);
            const app = express();

            if (this.hooks.preLoad) {
                await this.hooks.preLoad(app);
            }

            const server = http.Server(app);

            if (this.hooks.postLoad) {
                await this.hooks.postLoad(app);
            }

            if (this.hooks.preMiddleware) {
                await this.hooks.preMiddleware(app);
            }

            if (this.config.server.autoloadMiddlewares) {
                Middleware(this.config).build().forEach((middleware) => {
                    app.use(middleware);
                });
            }

            if (this.config.server.autoloadControllers) {
                Object.keys(Controllers).forEach((route) => {
                    const method = Controllers[route];
                    app.use('/', (_, res, next) => {
                        //API not cached in cloudfront
                        res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
                        res.header('Pragma', 'no cache')
                        res.header('Expires', 0)
                        return next();
                    }, method);
                });
            }

            if (this.hooks.postMiddleware) {
                await this.hooks.postMiddleware(app);
            }

            app.use(error.notFound);
            app.use(error.handler);

            //Integrate JWT Backported middleware 
            if (this.auth) {
                passport.use('jwt', this.auth);
            }

            await server.listen(this.config.server.port);
            console.log(`App running on port ${this.config.server.port}`);

            return Promise.resolve(app);
        } catch (err) {
            return Promise.reject(err);
        }
    }

}
