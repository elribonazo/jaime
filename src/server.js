import path from 'path';
import fs from 'fs';

import express from 'express';
import { Server, Engine } from 'Core';
import config from 'Config';
import App from '.';

(async () => {
    try {
        const server = new Server(config);
        const html = fs.readFileSync(path.join(process.cwd(), "dist/browser/index.html"));

        await server.enableDocument(html);
        await server.setHook("postLoad", async (server) => {

            server.engine('html', Engine);
            server.set('views', path.join(process.cwd(), "dist/browser"));
            server.set('view engine', 'html');
            server.get('*.*', express.static(path.join(process.cwd(), "dist/browser"), {
                maxAge: '1y'
            }));

            server.use("/", express.Router().all("*", async (req, res, next) => {
                try {
                    const content = await (new App(req)).render({
                        request: {
                            url: req.url,
                            method: req.method,
                            headers: req.headers
                        },
                        isBrowser: false
                    });
                    return res.render('index', {
                        content: await content,
                        jaime: JSON.stringify({
                            url: req.url,
                            method: req.method,
                            headers: req.headers
                        })
                    })
                } catch (err) {
                    return next(err);
                }
            }));
        });

        await server.start();

    } catch (err) {
        console.log("ERROR", err);
        process.exit(0);
    }
})(); 