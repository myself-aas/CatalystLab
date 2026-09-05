import re

# AuthDomainModal
with open("src/components/auth/AuthDomainModal.tsx", "r") as f:
    content = f.read()
replacements = [
    (r'text-\[\#8ea8c3\]', 'text-muted-foreground'),
    (r'text-\[\#38bdf8\]', 'text-primary'),
    (r'bg-\[\#415a77\]', 'bg-muted-foreground'),
    (r'hover:bg-\[\#52718e\]', 'hover:bg-muted-foreground/80'),
    (r'bg-\[\#0d1b2a\]', 'bg-muted'),
    (r'hover:bg-\[\#1a2d48\]', 'hover:bg-muted/80'),
]
for old, new in replacements:
    content = re.sub(old, new, content)
with open("src/components/auth/AuthDomainModal.tsx", "w") as f:
    f.write(content)

# TelemetryRoiCalculator
with open("src/components/pricing/TelemetryRoiCalculator.tsx", "r") as f:
    content = f.read()
replacements = [
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'accent-\[\#5E6AD2\]', 'accent-primary'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
    (r'hover:bg-\[\#6872D9\]', 'hover:bg-primary/90'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'from-white/\[0\.08\]', 'from-muted/40'),
    (r'to-white/\[0\.02\]', 'to-muted/10'),
    (r'bg-white/\[0\.08\]', 'bg-muted/40'),
]
for old, new in replacements:
    content = re.sub(old, new, content)
with open("src/components/pricing/TelemetryRoiCalculator.tsx", "w") as f:
    f.write(content)

