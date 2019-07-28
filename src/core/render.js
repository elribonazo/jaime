import path from 'path';
import fs from 'fs';

export async function Engine(_filePath, options, next) {
    try {
        const html = fs.readFileSync(path.join(process.cwd(), "dist/browser/index.html"));
        const content = options.content || {};
        return next(null, html.toString().replace('<!-- jaime -->', `
            <div id="app">${content.outerHTML}</div>
            <script type="text/javascript">
                (function(core){
                    core.jaime = JSON.parse('${options.jaime || '{}'}');
                }(this));
            </script>`));
    } catch (err) {
        return next(err);
    }
}

export async function pre(req, res, instance, isBrowser) {
    try {
        console.log("Calling pre ", isBrowser, "isBrowser");
        return Promise.resolve(await instance.fetch({
            platform: {
                browser: isBrowser,
                server: !isBrowser
            },
            route: {
                request: req,
                response: res
            }
        }))
    } catch (err) {
        return Promise.reject(err);
    }
}