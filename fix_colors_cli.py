import re

with open("src/components/docs/CLISimulator.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#060912\]', 'bg-background'),
    (r'bg-\[\#0B101D\]', 'bg-muted/40'),
    (r'bg-\[\#0E1526\]', 'bg-muted/60'),
    (r'bg-\[\#080D1A\]', 'bg-card'),
    (r'bg-\[\#06B6D4\]', 'bg-primary'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'hover:text-\[\#00F0FF\]', 'hover:text-cyan-400'),
    (r'hover:bg-\[\#00F0FF\]', 'hover:bg-cyan-400'),
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'text-\[\#FF0055\]', 'text-rose-500'),
    (r'hover:text-\[\#FF0055\]', 'hover:text-rose-500'),
    (r'border-\[\#06B6D4\]/40', 'border-primary/40'),
    (r'bg-\[\#00F0FF\]', 'bg-cyan-400'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/docs/CLISimulator.tsx", "w") as f:
    f.write(content)
