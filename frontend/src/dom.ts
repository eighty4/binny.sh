export function cloneTemplate(id: string): Node {
    return (document.getElementById(id) as HTMLTemplateElement).content.cloneNode(true)
}

export function removeChildNodes(elem: Node): void {
    while (elem.childNodes.length) elem.removeChild(elem.childNodes[0])
}
