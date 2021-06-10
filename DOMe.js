function DOMeBuilder(componentObj, parents, DOM) {
    console.log(componentObj)
    // recursively parse DOMeTree, adding current component to parents argument
    const children = Array.from(componentObj.children).map(childObj => childObj ? DOMeBuilder(childObj, [...parents, componentObj], DOM) : undefined)

    // evaluate if node exists in DOM and retrieve if so (avoid creating duplicates of root elements or all elements in page hydration)
    const nodePath = `/${parents.map(parent => parent.tagName).join("/")}/${componentObj.tagName}`
    const nodeEval = DOM.evaluate(nodePath, DOM, null, XPathResult.ANY_TYPE, null)

    // create node if necessary, check/update attributes and append children
    let node = nodeEval.iterateNext()
    if (!node) node = DOM.createElement(componentObj.tagName)
    Object.keys(componentObj.attributes).forEach(attribute => node[attribute] = componentObj.attributes[attribute])
    children.forEach(childObj => node.appendChild(childObj))

    // this is crucial for the recursion process but nice to have in general too ^^
    return node
}

async function FetchDOMeComponents(DOM) {
    const domParser = new DOMParser()
    
    // get all DOMe component templates from HTML
    const domeComponents = await Promise.all(Array.from(DOM.querySelectorAll('[data-dome-component]'))
        .map(async component => {
            // retrieve information for custom element declaration
            const tagName = component.tagName.toLowerCase()
            const document = domParser.parseFromString(await (await fetch(`./components/${tagName}.html`)).text(), 'text/html')
            const template = document.body.firstElementChild

            // add to document (SSR)
            DOM.body.insertBefore(template, DOM.body.firstElementChild)

            return { tagName, document, template }
        }))

    return domeComponents
}

async function DeclareDOMeComponent(tagName, template) {
    customElements.define(tagName,
        class extends HTMLElement {
            constructor() {
            super();
            let templateContent = template.content;

            const shadowRoot = this.attachShadow({ mode: 'open' })
                .appendChild(templateContent.cloneNode(true));
            }
        }
    )
}

async function DOMeSetup() {
    Array.from(document.getElementsByTagName("template")).forEach(template => {
        console.log(template)
        DeclareDOMeComponent(template.id, template)
    })
}

DOMeSetup(document)