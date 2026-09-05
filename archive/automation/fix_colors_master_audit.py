import re

with open("src/pages/MasterAuditExecutionPage.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'bg-\[\#5E6AD2\]/15', 'bg-primary/15'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'border-\[\#5E6AD2\]/30', 'border-primary/30'),
    (r'bg-\[\#5E6AD2\]/10', 'bg-primary/10'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'text-\[\#5E6AD2\]', 'text-primary'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/pages/MasterAuditExecutionPage.tsx", "w") as f:
    f.write(content)
