# Jaime
Jaime is a new server side focused framework. The approach and idea is trying to do the opposite other frameworks do.
Instead of compiling app on server, then loading it in client, and compiling the app again and re-render everything the goal here is to optimize and redefine this process.

## Acomplished ## 
1. Bundle optimization. By default all the routes are lazy loaded together with the components and are imported using system automatically.
This process is transparent for the user.
2. JSX, decorator and pure html bindings. Right now we already support adding any kind of element considered a valid html tag and binding the component events(clicks, changes, etc)
So when the app renders in frontend, its not rendering the whole component, its only binding the event.
3. Async component rendering, meaning you can use any kind of async, await method you want inside the render method. 
Also, the hability to create a fetch method, this one will run in server side and client side automatically and handle all the server -> browser state transfer for you automatically.
4. Express REST API framework integrated, which automatically creates and loads the controllers and models you define.

## ROADMAP ## 
1. Handling scss styles automatically
2. Client side rendering, micro rendering strategy
3. Improve transfer state
4. State management

### Controllers
This is how a controller looks like, nothing special, just a express route.
```javascript
import express from 'express';

const route = express.Router();

export const health = route.get("/api/status", async (req, res, next) => {
    try {
        return res.json({ success: true })
    } catch (err) {
        return next(err);
    }
});
```

### Main html file
By default the application content will be added to "<!-- jaime -->" so it is mandatory to keep it.
```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Webpack Appxxx</title>
</head>

<body>
    <!-- jaime -->
</body>

</html>
```

### Main application
Right now the application or framework i'm building must support multiple routes, but it can be used as a landing page.
This router will automatically lazy load any route in /src/routes/**.route.js.

```javascript

import { pre } from 'Core/render';

export default class App {

    routes = [{
        url: '*',
        import: 'default.route'
    }]

    async render({ request, isBrowser, response = {} }) {
        try {
            const route = this.routes.find((route) => (route.url === request.url || route.url === '*')) || {};
            const { default: Route } = await import(`./routes/${route.import || 'default.route'}`);
            const instance = new Route();
            Route.prototype.fetch = Route.fetch.bind(instance);
            let data = await pre(request, response, instance, isBrowser);
            const content = await instance.render(data);
            return Promise.resolve(await content);
        } catch (err) {
            return Promise.reject(err);
        }

    }
}
```

### How does a route look like?
The idea here is that anything you do and save in the fetch object will be available to the component when it renders.
This automatically handles the state transfer in a abstract way. Focus on building not on architecting.

```javascript
import { Jaime } from 'Core/compiler';
import { Route } from 'Core/route';


@Route({
    url: '*',
    fetch: async function fetch({ platform }) {
        this.platform = platform.browser ? 'browser' : 'server';
        if (platform.browser) {
            return Promise.resolve({ xd: ", functiona bastante bien y en el navegador también." })
        } else {
            return Promise.resolve({ xd: ", functiona bastante bien." })
        }
    }
})
export default class DefaultRoute {
    platform = 'server';

    async render(data) {
        return <div className={this.platform === 'server' ? 'server' : 'browser'}>
            <h1>Bienvenido a la ruta por defecto {data.xd}</h1>
            <p>By  <test name="Javier"></test> and <test name="Turri"></test>.</p>
        </div>
    }
}
```

### Jaime rendering engine
Jaime is integrated on its own express rendering engine which is super simple and we can render our landing page or multiple page application with 
```javascript
##SERVER SIDE
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

##CLIENT SIDE 
const request = window && window.jaime ? window.jaime : {};
const content = await (await (new App()).render({
    request: {
        url: request.url,
        method: request.method,
        headers: request.headers
    },
    isBrowser: true
}));
```
