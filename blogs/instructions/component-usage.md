# Custom MDX Component Usage

## Callout
```mdx
<Callout type="info" title="Info">
This is an informational callout.
</Callout>

<Callout type="warning" title="Warning">
This is a warning callout.
</Callout>

<Callout type="danger" title="Danger">
This is a danger callout.
</Callout>

<Callout type="success" title="Success">
This is a success callout.
</Callout>
```

## Tabs
```mdx
<Tabs tabs={[
  { label: "Tab 1", content: <p>Content 1</p> },
  { label: "Tab 2", content: <p>Content 2</p> }
]} />
```

## CodeBlock
Code blocks with syntax highlighting work automatically with standard markdown fences:

```tsx
console.log('Hello MDX');
```