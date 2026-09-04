import re

with open("src/components/telemetry/AuditScoreMatrixRadar.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#090D16\]', 'bg-card'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/telemetry/AuditScoreMatrixRadar.tsx", "w") as f:
    f.write(content)
