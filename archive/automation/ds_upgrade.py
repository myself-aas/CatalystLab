import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    orig = content
    
    # Text muted foreground -> ds-muted
    content = re.sub(r'\btext-muted-foreground\b', 'ds-muted', content)
    
    # Uppercase labels/eyebrows -> ds-eyebrow
    # Look for common eyebrow classes: text-xs uppercase tracking-wider, text-[10px] uppercase tracking-wider text-muted-foreground, etc.
    content = re.sub(r'text-\[?(?:10px|11px|xs)\]?\s+(?:font-[a-z]+\s+)?ds-muted\s+uppercase\s+tracking-wid(?:er|est)', 'ds-eyebrow', content)
    content = re.sub(r'text-\[?(?:10px|11px|xs)\]?\s+(?:font-[a-z]+\s+)?uppercase\s+tracking-wid(?:er|est)\s+ds-muted', 'ds-eyebrow', content)
    content = re.sub(r'text-xs font-semibold ds-muted uppercase tracking-wider', 'ds-eyebrow', content)
    
    # inputs/buttons to ds-control?
    # Maybe a bit risky for layout, but let's see. Let's replace inputs padding/height with ds-control
    # Let's not mess with inputs if we are not sure, but let's change text-muted-foreground.
    
    # Let's fix buttons/inputs containing some specific classes
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Upgraded {filepath}")

for root, _, files in os.walk('src/pages'):
    for file in files:
        if file in ['UserDashboardPage.tsx', 'AdminDashboardPage.tsx']:
            fix_file(os.path.join(root, file))

for root, _, files in os.walk('src/components/admin'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

for root, _, files in os.walk('src/components/user'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

