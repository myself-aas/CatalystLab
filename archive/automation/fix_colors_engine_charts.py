import re

with open("src/components/tool/EngineCharts.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/tool/EngineCharts.tsx", "w") as f:
    f.write(content)
