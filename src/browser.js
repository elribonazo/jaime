
import { transferNodes } from 'Core/compiler';
import App from '.';

(async () => {
    const request = window && window.jaime ? window.jaime : {};
    const content = await (await (new App()).render({
        request: {
            url: request.url,
            method: request.method,
            headers: request.headers
        },
        isBrowser: true
    }));
    const jaimeDom = document.body.querySelector('#app').childNodes.item(0);
    transferNodes(jaimeDom, content);
})(); 