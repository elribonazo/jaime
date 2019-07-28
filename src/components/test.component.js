import { Jaime } from 'Core/compiler';
import { Component } from 'Core/component';

@Component({
    state: {

    }
})
export class test {

    constructor(props) {
        this.name = props.name;
    }

    onClick() {
        console.log("Clico");
        this.name = 'other';
        debugger;
    }

    render() {
        return (<a href="#" onclick={this.onClick.bind(this)}>{this.name}</a>);
    }
};

