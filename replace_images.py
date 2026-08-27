import os
import re
import random

pexels_images = [
    "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
    "https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg",
    "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg",
    "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg",
    "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg",
    "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg",
    "https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg",
    "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg"
]

pexels_avatars = [
    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
]

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to match Unsplash URLs
    # Pattern: https://images.unsplash.com/photo-[a-zA-Z0-9\-]+(\?[^'"]*)?
    # Actually just match https://images.unsplash.com/photo- and the rest until quote or end
    
    def replacer(match):
        full_url = match.group(0)
        # If it looks like an avatar (has 'face' in the URL or is small)
        if 'face' in full_url or 'w=200' in full_url or 'w=96' in full_url:
            base = random.choice(pexels_avatars)
        else:
            base = random.choice(pexels_images)
        return base + "?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"

    new_content = re.sub(r'https://images\.unsplash\.com/photo-[a-zA-Z0-9\-]+(\?[^\'"\`\)]*)?', replacer, content)
    
    # Check for random unsplash url with template literal in src/components/blog/HeroImageLivePreview.tsx
    # https://images.unsplash.com/photo-${...}?auto=format...
    new_content = re.sub(r'https://images\.unsplash\.com/photo-\$\{.*?\}(\?[^\'"\`\)]*)?', lambda m: random.choice(pexels_images) + "?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            replace_in_file(os.path.join(root, file))

