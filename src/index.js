
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