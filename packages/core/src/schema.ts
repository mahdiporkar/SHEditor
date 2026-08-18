import { Schema, type MarkSpec, type NodeSpec } from "prosemirror-model";
import { addListNodes } from "prosemirror-schema-list";
import OrderedMap from "orderedmap";
import { tableNodes } from "prosemirror-tables";

const baseNodes: Record<string, NodeSpec> = {
  doc: { content: "block+" },
  paragraph: {
    attrs: { textAlign: { default: null } },
    content: "inline*",
    group: "block",
    parseDOM: [
      {
        tag: "p",
        getAttrs: (dom) => ({
          textAlign: (dom as HTMLElement).style.textAlign || null,
        }),
      },
    ],
    toDOM: (node) => [
      "p",
      node.attrs.textAlign
        ? { style: `text-align: ${String(node.attrs.textAlign)}` }
        : {},
      0,
    ],
  },
  text: { group: "inline" },
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM: () => ["br"],
  },
  heading: {
    attrs: { level: { default: 1 }, textAlign: { default: null } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
      tag: `h${level}`,
      getAttrs: (dom) => ({
        level,
        textAlign: (dom as HTMLElement).style.textAlign || null,
      }),
    })),
    toDOM: (node) => [
      `h${String(node.attrs.level)}`,
      node.attrs.textAlign
        ? { style: `text-align: ${String(node.attrs.textAlign)}` }
        : {},
      0,
    ],
  },
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM: () => ["blockquote", 0],
  },
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
    toDOM: () => ["pre", ["code", 0]],
  },
  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM: () => ["hr"],
  },
  image: {
    inline: false,
    group: "block",
    atom: true,
    draggable: true,
    attrs: {
      src: {},
      alt: { default: "" },
      title: { default: null },
      width: { default: null },
      align: { default: "center" },
    },
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          const el = dom as HTMLImageElement;
          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt") ?? "",
            title: el.getAttribute("title"),
            width: el.getAttribute("width")
              ? Number(el.getAttribute("width"))
              : null,
            align: el.dataset.align ?? "center",
          };
        },
      },
    ],
    toDOM: (node) => [
      "img",
      {
        src: node.attrs.src,
        alt: node.attrs.alt,
        title: node.attrs.title,
        width: node.attrs.width,
        "data-align": node.attrs.align,
        class: `she-image she-image--${String(node.attrs.align)}`,
      },
    ],
  },
};
const tableSpecs = tableNodes({
  tableGroup: "block",
  cellContent: "block+",
  cellAttributes: {
    background: {
      default: null,
      getFromDOM: (dom) => dom.style.backgroundColor || null,
      setDOMAttr: (value, attrs) => {
        if (value) attrs.style = `background-color: ${String(value)}`;
      },
    },
  },
});
const nodes = addListNodes(
  OrderedMap.from({ ...baseNodes, ...tableSpecs }),
  "paragraph block*",
  "block",
);

const marks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [{ tag: "strong" }, { tag: "b" }, { style: "font-weight=bold" }],
    toDOM: () => ["strong", 0],
  },
  italic: {
    parseDOM: [{ tag: "em" }, { tag: "i" }, { style: "font-style=italic" }],
    toDOM: () => ["em", 0],
  },
  underline: {
    parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
    toDOM: () => ["u", 0],
  },
  strike: {
    parseDOM: [
      { tag: "s" },
      { tag: "del" },
      { style: "text-decoration=line-through" },
    ],
    toDOM: () => ["s", 0],
  },
  code: { parseDOM: [{ tag: "code" }], toDOM: () => ["code", 0] },
  subscript: {
    excludes: "superscript",
    parseDOM: [{ tag: "sub" }],
    toDOM: () => ["sub", 0],
  },
  superscript: {
    excludes: "subscript",
    parseDOM: [{ tag: "sup" }],
    toDOM: () => ["sup", 0],
  },
  text_color: {
    attrs: { color: {} },
    parseDOM: [{ style: "color", getAttrs: (value) => ({ color: value }) }],
    toDOM: (mark) => [
      "span",
      { style: `color: ${String(mark.attrs.color)}` },
      0,
    ],
  },
  highlight: {
    attrs: { color: {} },
    parseDOM: [
      { style: "background-color", getAttrs: (value) => ({ color: value }) },
    ],
    toDOM: (mark) => [
      "mark",
      { style: `background-color: ${String(mark.attrs.color)}` },
      0,
    ],
  },
  font_family: {
    attrs: { family: {} },
    parseDOM: [
      { style: "font-family", getAttrs: (value) => ({ family: value }) },
    ],
    toDOM: (mark) => [
      "span",
      { style: `font-family: ${String(mark.attrs.family)}` },
      0,
    ],
  },
  font_size: {
    attrs: { size: {} },
    parseDOM: [{ style: "font-size", getAttrs: (value) => ({ size: value }) }],
    toDOM: (mark) => [
      "span",
      { style: `font-size: ${String(mark.attrs.size)}` },
      0,
    ],
  },
  link: {
    attrs: { href: {}, title: { default: null } },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom: HTMLElement | string) =>
          typeof dom === "string"
            ? false
            : {
                href: dom.getAttribute("href"),
                title: dom.getAttribute("title"),
              },
      },
    ],
    toDOM: (node) => [
      "a",
      {
        href: node.attrs.href,
        title: node.attrs.title,
        rel: "noopener noreferrer",
      },
      0,
    ],
  },
};
export const schema = new Schema({ nodes, marks });
