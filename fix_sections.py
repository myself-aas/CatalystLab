import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    orig = content
    
    # Replace outer sections that use py-* with ds-section where appropriate
    content = re.sub(r'py-[0-9]+\s+sm:px-6\s+lg:px-8', 'ds-section', content)
    content = re.sub(r'py-[0-9]+\s+sm:\s+', 'ds-section ', content)
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Added ds-section to {filepath}")

for root, _, files in os.walk('src/pages'):
    for file in files:
        if file in ['UserDashboardPage.tsx', 'AdminDashboardPage.tsx']:
            fix_file(os.path.join(root, file))

