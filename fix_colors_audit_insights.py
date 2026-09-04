import re

with open("src/components/tool/AuditInsights.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#38bdf8\]/10', 'bg-primary/10'),
    (r'border-\[\#38bdf8\]/30', 'border-primary/30'),
    (r'text-\[\#38bdf8\]', 'text-primary'),
    (r'text-\[\#cbd5e1\]', 'text-foreground'),
    (r'text-\[\#94a3b8\]', 'text-muted-foreground'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/tool/AuditInsights.tsx", "w") as f:
    f.write(content)
