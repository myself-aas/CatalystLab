import os

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    content = content.replace('w-full px-4 sm:px-8 lg:px-12', 'ds-page-shell')
    content = content.replace('mx-auto max-w-5xl text-center', 'text-center')
    content = content.replace('pt-28 pb-16 sm:pt-36 sm:pb-24', 'ds-section pt-28 sm:pt-36')

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

fix_file('src/components/home/HeroSection.tsx')
