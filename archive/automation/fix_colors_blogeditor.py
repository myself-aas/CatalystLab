import re

with open("src/pages/BlogEditorPage.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
    (r'hover:bg-\[\#6872D9\]', 'hover:bg-primary/90'),
    (r'text-\[\#6872D9\]', 'text-primary'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/pages/BlogEditorPage.tsx", "w") as f:
    f.write(content)
