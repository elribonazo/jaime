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