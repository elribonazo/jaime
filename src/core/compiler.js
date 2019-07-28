import camelcase from 'camelcase';
import sha1 from 'js-sha1';

import { pre } from 'Core/render';

const availableDomTags = [
    "a", "abbr", "acronym", "abbr", "address",
    "applet", "embed", "object", "area", "article", "aside", "audio",
    "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body",
    "br", "button", "canvas", "caption", "center", "cite", "code", "col",
    "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog",
    "dir", "ul", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption",
    "figure", "font", "footer", "form", "frame", "frameset",
    "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins",
    "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta",
    "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup",
    "option", "output", "p", "param", "picture", "pre", "progress", "q",
    "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small",
    "source", "span", "strike", "del", "s", "strong", "style", "sub",
    "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea",
    "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u",
    "ul", "var", "video", "wbr", "h1", "h2", "h3", "h4", "h5", "h6"];

const availableEventListeners = ['onclick'];

export function parseDomAttributes(element) {
    const attrs = [];
    if (element.attributes) {
        for (let i = 0; i < element.attributes.length; i++) {
            const { name, value } = element.attributes.item(i);
            attrs.push({ name, value });
        }
    }
    return attrs;
}

export function generateElementHash(element, tree) {
    const tag = element.nodeName.toLowerCase();
    const attrs = Array.apply(null, Array(element.attributes && element.attributes.length))
        .reduce((attrs, _, index) => {
            const name = element.attributes ? element.attributes.item(index).name : 'null';
            const value = element.attributes ? element.attributes.item(index).value : 'null';
            return `${attrs}[${name}=${value}]`;
        }, "");
    return {
        element: element,
        tag: tag,
        hash: sha1.create().update(`[${tree}][${tag}]${attrs}`).hex(),
        nodes: element.childNodes.length
    };
}

export function findAttrDiff(source, target) {
    const sourceAttributes = parseDomAttributes(source);
    const targetAttributes = parseDomAttributes(target);
    const toRemove = sourceAttributes.filter((attr) => !targetAttributes.find((attr2) => attr.name === attr2.name));
    const toAdd = targetAttributes.filter((attr) => !sourceAttributes.find(attr2 => attr.name === attr2.name));
    const toUpdate = targetAttributes.filter((attr) => !sourceAttributes.find(attr2 => attr.name === attr2.name && attr.value === attr2.value));
    return { toRemove, toAdd, toUpdate }
}

export function transferNodes(sourceDom, targetDom, tree = ['-']) {
    console.log("Starting transfer node ", sourceDom, 'vs', targetDom, ' in tree ', tree);
    const source = generateElementHash(sourceDom, tree);
    const target = generateElementHash(targetDom, tree);

    if (source.tag !== target.tag) {
        console.log("The old tag ", source.tag, " does not match ", target.tag, " so before continue we need to replace it");
        source.element.parentNode.replaceChild(newNode, source.element);
    }

    console.log("Okey, now that ", source.element.nodeName, 'matches', target.element.nodeName, 'we can go for attributes in tree', tree);
    const { toRemove = [], toAdd = [], toUpdate = [] } = findAttrDiff(source.element, target.element);

    toRemove.forEach((attr) => {
        console.log("Removing", attr.name);
        source.element.removeAttribute(attr.name);
    });

    const addUpdate = [...toAdd, ...toUpdate];
    addUpdate.forEach((attr) => {
        console.log("Adding or updating", attr.name, " with ", attr.value);
        source.element.setAttribute(attr.name, attr.value);
    });

    if (source.element.nodeValue !== target.element.nodeValue) {
        console.log(" node values didn't match Replacing for child ", target.element);
        source.element.nodeValue = target.element.nodeValue;
    }

    const targetEventListeners = Object.values(availableEventListeners)
        .reduce((events, event) => target.element[event] ? ([...events, { name: event, fn: target.element[event] }]) : (events), []);

    for (let n = 0; n < targetEventListeners.length; n++) {
        const event = targetEventListeners[n];
        source.element.addEventListener(event.name.replace("on", ""), event.fn);
    }

    console.log("Checking if target ", target.element, "  has children", target.element.childNodes);
    if (target.element.childNodes && target.element.childNodes.length > 0) {
        for (let i = 0; i < target.element.childNodes.length; i++) {
            const targetNode = target.element.childNodes.item(i);
            let sourceNode = source.element.childNodes.item(i);
            console.log("Target child", i, " is ", targetNode, " and source ", sourceNode);
            if (!sourceNode) {
                sourceNode = targetNode;
                console.log("Adding it because it didn't exist");
                source.element.appendChild(sourceNode);
            } else {
                tree.push(sourceNode.nodeName.toLowerCase());
                console.log("Recursing ", sourceNode, " target ", targetNode, " in ", tree);
                transferNodes(sourceNode, targetNode, tree);
            }
        }
    }
}

export async function Jaime(tag, attrs = {}, ...children) {
    try {
        if (tag.isComponent) {
            const componentProps = attrs;
            if (children && Array.isArray(children) && children.length > 0) {
                componentProps.children = children;
            }
            const component = new tag(componentProps);
            return Promise.resolve(component.render());
        }
        // Custom Components will be functions
        if (typeof tag === 'function') {
            return Promise.resolve(tag(attrs));
        }

        const isKnownElement = availableDomTags.indexOf(`${tag}`) !== -1;
        if (isKnownElement) {
            const fragments = document.createDocumentFragment()
            const element = document.createElement(`${tag}`);
            const events = Object.keys(attrs || {})
                .filter(event => availableEventListeners.indexOf(event) !== -1)
                .reduce((all, event) => ({ ...all, [event]: attrs[event] }), {});

            for (let i = 0; i < Object.keys(events).length; i++) {
                const event = Object.keys(events)[i];
                element.addEventListener(event.replace("on", ""), (e) => events[event](e));
            }

            const renderedChildren = await Promise.all(children);
            renderedChildren.forEach(child => {
                if (child instanceof HTMLElement) {
                    fragments.appendChild(child)
                } else if (typeof child === 'string') {
                    const textnode = document.createTextNode(child)
                    fragments.appendChild(textnode)
                } else {
                    // later other things could not be HTMLElement not strings
                    console.log('not appendable', child);
                }
            });

            element.appendChild(fragments)
            // Merge element with attributes
            Object.assign(element, attrs)
            return Promise.resolve(element);
        } else {
            const load = await import(`../components/${tag}.component.js`);
            const Component = load[tag];
            if (!Component) {
                throw new Error("The module was exported wrongly.")
            }
            const componentProps = attrs;
            if (children && Array.isArray(children) && children.length > 0) {
                componentProps.children = children;
            }
            const instance = Component.isComponent ? new Component(componentProps) : Component(componentProps);
            return Promise.resolve(await instance.render());
        }
    } catch (err) {
        return Promise.reject(err);
    }
}