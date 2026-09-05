import re

with open("src/components/telemetry/SideBySideDeltaMatrix.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#111726\]/90', 'bg-card/90'),
    (r'text-\[\#06B6D4\]', 'text-primary'),
    (r'focus:ring-\[\#06B6D4\]/50', 'focus:ring-primary/50'),
    (r'focus:border-\[\#06B6D4\]', 'focus:border-primary'),
    (r'text-\[\#10B981\]', 'text-emerald-500'),
    (r'focus:ring-\[\#10B981\]/50', 'focus:ring-emerald-500/50'),
    (r'focus:border-\[\#10B981\]', 'focus:border-emerald-500'),
    (r'from-\[\#06B6D4\]', 'from-primary'),
    (r'to-\[\#10B981\]', 'to-emerald-500'),
    (r'shadow-\[\#06B6D4\]/20', 'shadow-primary/20'),
    (r'bg-\[\#111726\]/80', 'bg-card/80'),
    (r'bg-\[\#10B981\]/15', 'bg-emerald-500/15'),
    (r'border-\[\#10B981\]/30', 'border-emerald-500/30'),
    (r'border-\[\#06B6D4\]/40', 'border-primary/40'),
    (r'border-\[\#10B981\]/40', 'border-emerald-500/40'),
    (r'bg-\[\#090D16\]', 'bg-card'),
    (r'bg-\[\#111726\]', 'bg-muted/40'),
    (r'bg-\[\#EF4444\]/15', 'bg-rose-500/15'),
    (r'text-\[\#EF4444\]', 'text-rose-500'),
    (r'border-\[\#EF4444\]/30', 'border-rose-500/30'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/telemetry/SideBySideDeltaMatrix.tsx", "w") as f:
    f.write(content)
