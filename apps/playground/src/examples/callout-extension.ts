import { defineExtension } from '@sheditor/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const calloutExtension = defineExtension({
  name: 'demoCallout',
  plugins: () => [new Plugin({ props: { decorations(state) {
    const decorations: Decoration[] = [];
    state.doc.descendants((node, position) => {
      if (node.type.name === 'blockquote') decorations.push(Decoration.node(position, position + node.nodeSize, { class: 'demo-callout' }));
    });
    return DecorationSet.create(state.doc, decorations);
  } } })],
});
