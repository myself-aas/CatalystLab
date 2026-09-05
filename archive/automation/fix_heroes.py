import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    # Replace py-14 sm:py-20 with ds-section
    content = content.replace('py-14 sm:py-20', 'ds-section')
    
    # Replace text-muted-foreground with ds-muted
    content = content.replace('text-muted-foreground', 'ds-muted')

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed hero in {filepath}")

fix_file('src/pages/MasterAuditExecutionPage.tsx')
fix_file('src/pages/ToolPage.tsx')
fix_file('src/pages/MasterAuditPage.tsx')

