import { Jaime } from 'Core/compiler';
import { Route } from 'Core/route';

@Route({
    url: '/view1'
})
export default class View1Route {
    async render(data) {
        return <div>
            <a href="#">Hola, whatever</a>
        </div>
    }
}