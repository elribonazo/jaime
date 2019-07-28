import { Jaime } from 'Core/compiler';
import { Route } from 'Core/route';


@Route({
    url: '/view2'
})
export default class View2Route {

    async render(data) {
        return <div>
            <a href="#">Good bye {data.xd}</a>
        </div>
    }

}