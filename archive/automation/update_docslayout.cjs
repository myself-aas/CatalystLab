const fs = require('fs');
let code = fs.readFileSync('src/components/docs/DocsLayout.tsx', 'utf8');

// 1. Add TOC state and useEffect
const tocHooks = `
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = Array.from(contentRef.current.querySelectorAll('h2, h3'));
    const newToc = headings.map((h) => ({
      id: h.id || h.textContent?.toLowerCase().replace(/\\s+/g, '-') || '',
      text: h.textContent || '',
      level: parseInt(h.tagName.substring(1))
    }));
    // Assign ids to headings if missing
    headings.forEach((h, i) => {
      if (!h.id) h.id = newToc[i].id;
    });
    setToc(newToc);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [children]);
`;

code = code.replace(/const searchRef = useRef<HTMLInputElement>\(null\);/, 'const searchRef = useRef<HTMLInputElement>(null);\n' + tocHooks);

// 2. Add border-l-2 border-[#0066FF] instead of border-primary
code = code.replace(/border-primary bg-primary\/10 font-semibold text-primary/, 'border-[#0066FF] bg-[#0066FF]/10 font-semibold text-white');
code = code.replace(/border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/g, 'border-transparent text-[#999999] hover:text-white hover:bg-white/5');
code = code.replace(/text-muted-foreground/g, 'text-[#999999]');
code = code.replace(/text-foreground/g, 'text-white');
code = code.replace(/bg-background/g, 'bg-[#000000]');
code = code.replace(/border-border/g, 'border-white/10');
code = code.replace(/bg-muted\/40/g, 'bg-[#0B0B0B]');
code = code.replace(/bg-card/g, 'bg-[#050505]');
code = code.replace(/text-primary/g, 'text-[#0066FF]');
code = code.replace(/bg-primary/g, 'bg-[#0066FF]');

// 3. Update docs-content wrapper
code = code.replace(/<div className="docs-content docs-devsite-article">{children}<\/div>/, '<div ref={contentRef} className="docs-content docs-devsite-article">{children}</div>');

// 4. Add TOC column
const tocColumn = `
            <aside className="hidden xl:block w-[240px] shrink-0 border-l border-white/10 py-8 px-6">
              <div className="sticky top-24">
                <h4 className="text-sm font-semibold text-white mb-4">On this page</h4>
                <nav className="flex flex-col gap-2.5">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={\`#\${item.id}\`}
                      className={\`text-[13px] leading-tight transition-colors \${
                        activeId === item.id ? 'text-[#0066FF] font-medium' : 'text-[#999999] hover:text-white'
                      }\`}
                      style={{ paddingLeft: \`\${(item.level - 2) * 12}px\` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
`;

code = code.replace(/<\/article>\s*<\/div>\s*<\/div>/, '</article>\n' + tocColumn + '</div>\n</div>');

fs.writeFileSync('src/components/docs/DocsLayout.tsx', code);
