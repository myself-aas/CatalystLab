import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    # Sidebar main links
    content = content.replace('"bg-muted/80 text-foreground font-medium"', '"bg-primary text-primary-foreground shadow-sm border border-border font-medium"')
    content = content.replace('"text-muted-foreground hover:bg-muted/50 hover:text-foreground"', '"bg-background ds-muted hover:text-foreground hover:bg-muted border border-transparent hover:border-border"')
    
    # Engine submenu links
    content = content.replace('"bg-black/5 dark:bg-white/10 text-foreground font-medium"', '"bg-primary/10 text-primary font-bold border border-primary/20"')
    content = content.replace('"text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"', '"ds-muted hover:bg-muted hover:text-foreground border border-transparent"')

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed sidebar in {filepath}")

fix_file('src/components/layout/Sidebar.tsx')
fix_file('src/components/layout/MobileBottomNav.tsx')
fix_file('src/components/layout/MainMenuOverlay.tsx')

