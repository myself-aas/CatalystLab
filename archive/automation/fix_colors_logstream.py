import re

with open("src/components/dashboard/LiveCronLogStream.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'text-\[\#FFB800\]', 'text-amber-500'),
    (r'text-\[\#FF0055\]', 'text-rose-500'),
    (r'text-\[\#D946EF\]', 'text-fuchsia-500'),
    (r'bg-\[\#080D1A\]', 'bg-card'),
    (r'bg-\[\#0B101D\]', 'bg-muted/40'),
    (r'bg-\[\#00FF66\]', 'bg-emerald-400'),
    (r'bg-\[\#0E1526\]', 'bg-muted/60'),
    (r'border-\[\#06B6D4\]/40', 'border-cyan-500/40'),
    (r'bg-\[\#060912\]/80', 'bg-background/80'),
    (r'bg-\[\#060912\]', 'bg-background'),
    (r'bg-\[\#06B6D4\]', 'bg-cyan-500'),
    (r'border-\[\#06B6D4\]', 'border-cyan-500'),
    (r'accent-\[\#06B6D4\]', 'accent-cyan-500'),
    (r'bg-\[\#00F0FF\]', 'bg-cyan-400'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/dashboard/LiveCronLogStream.tsx", "w") as f:
    f.write(content)
