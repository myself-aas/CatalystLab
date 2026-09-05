import re

with open("src/components/common/EnterpriseScaleChart.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#38bdf8\]', 'text-sky-400'),
    (r'bg-\[\#112239\]', 'bg-card'),
    (r'border-\[\#38bdf8\]/40', 'border-sky-400/40'),
    (r'bg-\[\#38bdf8\]/10', 'bg-sky-400/10'),
    (r'bg-\[\#0d1b2a\]/80', 'bg-background/80'),
    (r'bg-\[\#0d1b2a\]', 'bg-background'),
    (r'bg-\[\#c5d3e8\]', 'bg-primary'),
    (r'bg-\[\#162a45\]', 'bg-muted'),
    (r'border-\[\#38bdf8\]', 'border-sky-400'),
    (r'ring-\[\#38bdf8\]', 'ring-sky-400'),
    (r'shadow-\[0_0_20px_rgba\(56,189,248,0\.2\)\]', 'shadow-[0_0_20px_rgba(56,189,248,0.2)]'),
    (r'hover:bg-\[\#132742\]', 'hover:bg-muted/80'),
    (r'hover:border-\[\#415a77\]', 'hover:border-muted-foreground'),
    (r'text-\[\#8ea8c3\]', 'text-muted-foreground'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/common/EnterpriseScaleChart.tsx", "w") as f:
    f.write(content)
