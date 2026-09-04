import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    orig = content
    
    # We will just look for className="...ds-card..." and if it's near an input or textarea, we'll replace it.
    # Actually, a simpler way is to just use a regular expression that finds <input ... /> properly.
    # Or, we can just replace 'ds-card' with 'ds-control bg-background border border-border' for specific files if we know where they are.
    
    # Let's use a simpler heuristic: find <input and <textarea, and grab until /> or </textarea>.
    
    def replace_input_card(m):
        full_match = m.group(0)
        new_class = full_match.replace('ds-card', 'ds-control bg-background border border-border px-4 text-sm')
        return new_class

    content = re.sub(r'<input\b.*?>', replace_input_card, content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<textarea\b.*?>', replace_input_card, content, flags=re.DOTALL | re.IGNORECASE)
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed inputs in {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

