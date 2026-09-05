import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    orig = content
    
    # We want to replace ds-card on inputs and textareas with standard input classes + ds-control
    # It might be hard to parse HTML, so we'll just look for common input class patterns.
    # Actually, we can just replace 'ds-card' inside <input ... className="...ds-card... "> 
    # Let's use regex to find `<input ... className="...ds-card..."` and `<textarea ...`
    
    def replace_input_card(m):
        full_match = m.group(0)
        # replace ds-card with proper input styles
        new_class = full_match.replace('ds-card', 'ds-control bg-background border border-border px-4 text-sm')
        return new_class

    content = re.sub(r'<input[^>]*className="[^"]*ds-card[^"]*"[^>]*>', replace_input_card, content, flags=re.DOTALL)
    content = re.sub(r'<textarea[^>]*className="[^"]*ds-card[^"]*"[^>]*>', replace_input_card, content, flags=re.DOTALL)
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed inputs in {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

