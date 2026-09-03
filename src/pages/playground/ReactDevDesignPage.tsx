import React from 'react';
import { ReactDevLayout } from '../../components/docs/react-dev/Layout';
import { Note, Pitfall, DeepDive, Wip, Challenge } from '../../components/docs/react-dev/Callout';
import { CodeBlock } from '../../components/docs/react-dev/CodeBlock';
import { CodeDiagram } from '../../components/docs/react-dev/CodeDiagram';
import { TableOfContents } from '../../components/docs/react-dev/TableOfContents';
import { useActiveHeading } from '../../utils/toc';
import { NavGroup } from '../../types/design-system';

const sidebarGroups: NavGroup[] = [
  {
    group: 'Design System',
    items: [
      { id: '1', path: '/design-system', title: 'Overview' },
      { id: '2', path: '#callouts', title: 'MDX Callouts', badge: 'New' },
      { id: '3', path: '#codeblocks', title: 'Code Blocks' },
      { id: '4', path: '#typography', title: 'Typography' },
    ]
  },
  {
    group: 'Components',
    items: [
      { id: '5', path: '#buttons', title: 'Buttons' },
      { id: '6', path: '#cards', title: 'Cards' },
    ]
  }
];

export const ReactDevDesignPage: React.FC = () => {
  const activeHeading = useActiveHeading(['callouts', 'codeblocks', 'typography', 'buttons', 'cards']);

  return (
    <ReactDevLayout 
      sidebarGroups={sidebarGroups} 
      activePath="/design-system"
      brandName="Catalyst Design"
    >
      <div className="flex xl:gap-12">
        <div className="min-w-0 max-w-3xl flex-auto pt-6 pb-24 lg:pb-16 prose prose-cyan dark:prose-invert">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            React.dev Design System
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            A meticulous faithful recreation of the react.dev design tokens, typography scales, and MDX callout patterns.
          </p>

          <h2 id="callouts" className="text-2xl font-bold mt-12 mb-6 text-foreground flex items-center group">
            MDX Callouts
            <a href="#callouts" className="react-heading-anchor">#</a>
          </h2>
          <p>
            Callouts are used to draw attention to important information, common pitfalls, and deep technical details.
          </p>

          <Note title="Note">
            This is a standard Note callout. Use this for general tips, context, and auxiliary information that the reader should keep in mind.
          </Note>

          <Pitfall title="Pitfall">
            Avoid using generic design systems without customizing the tokens! This is a Pitfall callout, used for warnings and common anti-patterns.
          </Pitfall>

          <DeepDive title="How React handles CSS Variables" badge="Advanced">
            <p>
              In a typical React application, theming can be achieved by toggling a class on the `&lt;html&gt;` element (e.g., `.dark`) which then redefines CSS custom properties.
            </p>
            <CodeBlock 
              code={`html.dark {\n  --react-cyan: #149eca;\n  --react-wash: #16181d;\n}`} 
              language="css" 
              filename="styles.css"
            />
          </DeepDive>

          <Wip title="Under Construction" version="2.0">
            This section is currently being updated to reflect the latest changes in the design system. Check back later!
          </Wip>

          <Challenge number={1} title="Implement a custom callout" hint="Look at how the Note component is structured.">
            <p>Try creating a new callout type called "Success" using the green color palette.</p>
          </Challenge>

          <h2 id="codeblocks" className="text-2xl font-bold mt-16 mb-6 text-foreground flex items-center group">
            Code Blocks
            <a href="#codeblocks" className="react-heading-anchor">#</a>
          </h2>
          <p>
            The code block components support filename headers, line numbers, line highlighting, and copy-to-clipboard functionality.
          </p>

          <CodeBlock 
            code={`import React from 'react';\nimport { Note } from './Callout';\n\nexport default function App() {\n  return (\n    <Note>\n      Welcome to the design system!\n    </Note>\n  );\n}`}
            language="tsx"
            filename="App.tsx"
            highlightedLines={[5, 6, 7]}
            showLineNumbers={true}
          />

          <h3 className="text-xl font-bold mt-12 mb-4">Code Diagram</h3>
          <p>CodeDiagram is used to display code alongside a visual representation or preview.</p>
          
          <CodeDiagram>
            <CodeBlock 
              code={`function Avatar({ user }) {\n  return (\n    <img \n      className="avatar"\n      src={user.imageUrl}\n      alt={user.name}\n    />\n  );\n}`}
              language="tsx"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-md"></div>
              <span className="text-sm font-medium">Avatar Preview</span>
            </div>
          </CodeDiagram>

          <CodeBlock 
            code={`$ npm install lucide-react\n$ npm run dev`}
            language="bash"
            filename="Terminal"
          />

          <h2 id="typography" className="text-2xl font-bold mt-16 mb-6 text-foreground flex items-center group">
            Typography
            <a href="#typography" className="react-heading-anchor">#</a>
          </h2>
          <p>
            The typography scale uses a system sans-serif font stack with specific tracking and line-height adjustments to match the pristine look of React.dev.
          </p>

          <h2 id="buttons" className="text-2xl font-bold mt-16 mb-6 text-foreground flex items-center group">
            Buttons
            <a href="#buttons" className="react-heading-anchor">#</a>
          </h2>
          <div className="flex gap-4 mb-8">
            <button className="react-btn-primary">Primary Button</button>
            <button className="react-btn-secondary">Secondary Button</button>
          </div>

        </div>

        {/* Right Sidebar - TOC */}
        <TableOfContents 
          items={[
            { id: 'callouts', title: 'MDX Callouts', level: 2 },
            { id: 'codeblocks', title: 'Code Blocks', level: 2 },
            { id: 'typography', title: 'Typography', level: 2 },
            { id: 'buttons', title: 'Buttons', level: 2 },
          ]} 
          activeId={activeHeading} 
        />
      </div>
    </ReactDevLayout>
  );
};
