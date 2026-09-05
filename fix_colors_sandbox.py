import re

with open("src/components/blog/InteractiveTelemetrySandbox.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#080D1A\]', 'bg-card'),
    (r'bg-\[\#0B101D\]', 'bg-muted/40'),
    (r'bg-\[\#00F0FF\]', 'bg-cyan-400'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'bg-\[\#060912\]', 'bg-background'),
    (r'bg-\[\#06B6D4\]/20', 'bg-primary/20'),
    (r'bg-\[\#06B6D4\]', 'bg-primary'),
    (r'border-\[\#06B6D4\]', 'border-primary'),
    (r'accent-\[\#06B6D4\]', 'accent-primary'),
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'accent-\[\#00FF66\]', 'accent-emerald-400'),
    (r'text-\[\#06B6D4\]', 'text-primary'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/blog/InteractiveTelemetrySandbox.tsx", "w") as f:
    f.write(content)
