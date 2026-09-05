import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    # Replace layout
    content = content.replace('max-w-[800px] mx-auto', 'ds-page-shell')
    content = content.replace('max-w-4xl mx-auto', 'ds-page-shell')
    content = content.replace('text-muted-foreground', 'ds-muted')

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

fix_file('src/components/home/HeroSection.tsx')

