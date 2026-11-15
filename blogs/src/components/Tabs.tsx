import { Children, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';

interface TabProps {
  label: string;
  children: ReactNode;
}

/** One panel of a `<Tabs>` group. Renders nothing on its own. */
export function Tab(_props: TabProps): null {
  return null;
}

interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
}

/**
 * Segmented tab group (AGENTS.md §6 pattern). Author it as:
 *
 *   <Tabs>
 *     <Tab label="npm">...</Tab>
 *     <Tab label="pnpm">...</Tab>
 *   </Tabs>
 */
export function Tabs({ children, defaultIndex = 0 }: TabsProps) {
  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> => isValidElement<TabProps>(child) && typeof child.props.label === 'string'
  );
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(tabs.length - 1, 0)));
  const baseId = useId();
  if (!tabs.length) return null;

  return (
    <div className="ds-card my-6 overflow-hidden">
      <div role="tablist" className="flex gap-2 border-b border-border bg-muted/40 p-1 font-mono text-xs">
        {tabs.map((tab, index) => (
          <button
            key={tab.props.label}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${index}`}
            onClick={() => setActive(index)}
            className={`rounded-md px-3 py-1.5 transition-all ${
              active === index ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className="p-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      >
        {tabs[active].props.children}
      </div>
    </div>
  );
}
