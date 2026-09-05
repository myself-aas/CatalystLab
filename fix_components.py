import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    
    # Check for card styling
    content = re.sub(
        r'\brounded-(?:xl|2xl|3xl|lg)\s+border\s+border-[a-zA-Z0-9\/\-]+(?:\s+dark:border-[a-zA-Z0-9\/\-\[\]\.]+)?\s+bg-(?:card|muted|background)(?:\/[0-9]+)?(?:\s+dark:bg-[a-zA-Z0-9\/\-\[\]\.]+)?(?:\s+shadow-[a-zA-Z0-9\/\-]+)?(?:\s+dark:shadow-[a-zA-Z0-9\/\-]+)?(?:\s+backdrop-blur-[a-zA-Z0-9\/\-]+)?\b',
        'ds-card',
        content
    )
    
    # Find any remaining ds-card without p- or px- or py- and add p-4
    def add_p4_to_card(m):
        cls = m.group(1)
        if not re.search(r'\bp-[0-9\.]+\b', cls) and not re.search(r'\bpx-[0-9\.]+\b', cls) and not re.search(r'\bpy-[0-9\.]+\b', cls):
            cls += " p-4"
        return 'className="' + cls + '"'
        
    content = re.sub(r'className="([^"]*ds-card[^"]*)"', add_p4_to_card, content)

    # Let's fix small text that act as eyebrows to ds-eyebrow
    # We should define ds-eyebrow if it isn't in index.css
    
    # We don't want to break the app so we will apply it locally first

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src/components/admin'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

for root, _, files in os.walk('src/components/user'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

