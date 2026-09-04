import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # text-xs font-bold text-amber-600 uppercase tracking-wider (and similar) -> ds-eyebrow text-amber-600
    # The ds-eyebrow class sets color, so we can either keep or remove text-amber-600. Let's remove it and let the primary color rule, for uniformity.
    content = re.sub(r'text-[a-z0-9\[\]\-]+\s+font-[a-z]+\s+text-[a-z0-9\-]+\s+uppercase\s+tracking-wid(?:er|est)', 'ds-eyebrow', content)
    
    # ds-muted text-xs uppercase tracking-wider font-semibold -> ds-eyebrow
    content = re.sub(r'ds-muted\s+text-[a-z0-9\[\]\-]+\s+uppercase\s+tracking-wid(?:er|est)\s+font-[a-z]+', 'ds-eyebrow', content)
    
    # text-[10px] uppercase font-bold ds-muted -> ds-eyebrow
    content = re.sub(r'text-\[10px\]\s+uppercase\s+font-bold\s+ds-muted', 'ds-eyebrow', content)
    
    # text-xs font-mono font-semibold ds-muted uppercase -> ds-eyebrow
    content = re.sub(r'text-xs\s+font-mono\s+font-semibold\s+ds-muted\s+uppercase', 'ds-eyebrow', content)

    # uppercase tracking-wider font-bold -> ds-eyebrow
    # be careful with this one
    content = re.sub(r'ds-muted\s+uppercase\s+tracking-wid(?:er|est)\s+font-bold', 'ds-eyebrow', content)
    content = re.sub(r'uppercase\s+text-xs\s+font-semibold', 'ds-eyebrow', content)

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed eyebrows {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') and ('user' in root or 'admin' in root or 'Dashboard' in file):
            fix_file(os.path.join(root, file))

