// Labels AI-generated images in Markdown, as the EU AI Act asks for (Art. 50).
// Mark an image through its title:
//   ![Alt text](/assets/img/blog/x.png "AI-generated (Gemini)")
// It is wrapped in a span with a small corner label, the same look as the
// hero image's ImageLabel.
const marker = /^AI[- ]generated/i;

export default function rehypeAiImages() {
    const walk = (node) => {
        if (!node.children) return;
        node.children = node.children.map((child) => {
            const title = child.type === 'element' && child.tagName === 'img' ? child.properties?.title : undefined;
            if (typeof title === 'string' && marker.test(title)) {
                return {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['ai-image'] },
                    children: [
                        child,
                        { type: 'element', tagName: 'span', properties: { className: ['ai-image-label'] }, children: [{ type: 'text', value: title }] },
                    ],
                };
            }
            walk(child);
            return child;
        });
    };
    return walk;
}
