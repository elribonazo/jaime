export const Component = (value) => {
    return function decorator(target, key) {
        target.isComponent = true;
    }
}