export default function removeChildNodes(elem: Node): void {
    while (elem.childNodes.length) elem.removeChild(elem.childNodes[0])
}
