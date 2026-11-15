# MDX Component Usage

Posts can use these components without importing them. They are registered in
`blogs/src/components/index.ts` (`mdxComponents`). Leave a blank line between a
component's opening tag and Markdown content, so the content is parsed as
Markdown.

## Callout

`type` is `info` (default), `warning`, `danger` or `success`. `title` is optional.

```mdx
<Callout type="warning" title="Measure first">

Lighthouse thresholds are heuristics. Confirm with field data before refactoring.

</Callout>
```

## Tabs

Each `<Tab>` needs a `label`. The first tab is selected unless you pass `defaultIndex`.

```mdx
<Tabs>
  <Tab label="npm">

    npm install @mdx-js/rollup

  </Tab>
  <Tab label="pnpm">

    pnpm add @mdx-js/rollup

  </Tab>
</Tabs>
```

## Code blocks

Standard fenced code blocks render through `CodeBlock`: a language label from the
fence tag and a copy button. There is no syntax highlighting.

````mdx
```ts
const budget = { lcpMs: 2500 };
```
````

## Images

Put files under `blogs/assets/` and reference them by absolute path
(`/blogs/assets/images/diagrams/x.png`) or relative to the post
(`../assets/images/diagrams/x.png`). The build fingerprints them, and a missing
file fails the build.

```mdx
![DOM depth before and after flattening](../assets/images/diagrams/dom-depth.png)
```

## Tables, links and the rest

GitHub-flavoured Markdown tables and strikethrough are supported. Links are
sanitised: `javascript:` and other unsafe schemes render as plain text, and
external links open in a new tab.

## Static HTML for crawlers

The prerendered page (what non-JavaScript crawlers read) unwraps components to
their text. A `<Callout>` body and every `<Tab>` body appear as paragraphs, so do
not rely on a component to carry meaning that the text alone does not.
