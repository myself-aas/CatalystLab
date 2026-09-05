import re

with open("src/pages/docs/SystemOverviewDoc.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'border-\[\#5E6AD2\]', 'border-primary'),
    (r'bg-\[\#5E6AD2\]/10', 'bg-primary/10'),
    (r'bg-\[\#5E6AD2\]/15', 'bg-primary/15'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'border-white/\[0\.08\]', 'border-border'),
    (r'bg-white/\[0\.02\]', 'bg-muted/20'),
    (r'bg-white/\[0\.03\]', 'bg-muted/30'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'bg-white/\[0\.06\]', 'bg-muted/60'),
    (r'border-\[\#5E6AD2\]/30', 'border-primary/30'),
    (r'border-\[\#5E6AD2\]/40', 'border-primary/40'),
    (r'border-\[\#5E6AD2\]/50', 'border-primary/50'),
    (r'hover:border-\[\#5E6AD2\]/50', 'hover:border-primary/50'),
    (r'hover:border-\[\#5E6AD2\]/40', 'hover:border-primary/40'),
    (r'hover:bg-\[\#5E6AD2\]/15', 'hover:bg-primary/15'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/pages/docs/SystemOverviewDoc.tsx", "w") as f:
    f.write(content)
