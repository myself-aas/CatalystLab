import re

with open("src/components/ui/CodeBlock.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'text-\[\#FFB800\]', 'text-amber-500'),
    (r'text-\[\#A855F7\]', 'text-purple-500'),
    (r'bg-\[\#070A12\]', 'bg-card'),
    (r'bg-\[\#0B101B\]', 'bg-muted/40'),
    (r'bg-\[\#EF4444\]/80', 'bg-rose-500/80'),
    (r'bg-\[\#F59E0B\]/80', 'bg-amber-500/80'),
    (r'bg-\[\#10B981\]/80', 'bg-emerald-500/80'),
    (r'text-\[\#06B6D4\]', 'text-primary'),
    (r'text-\[\#10B981\]', 'text-emerald-500'),
    (r'bg-\[\#00F0FF\]', 'bg-cyan-400'),
    (r'via-\[\#06B6D4\]/40', 'via-primary/40'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/ui/CodeBlock.tsx", "w") as f:
    f.write(content)
