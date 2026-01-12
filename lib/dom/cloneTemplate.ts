export default function cloneTemplate(id: string): Node {
    return (
        document.getElementById(id) as HTMLTemplateElement
    ).content.cloneNode(true)
}
