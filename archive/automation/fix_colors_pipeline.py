import re

with open("src/components/integrations/PipelineVisualizer.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'bg-\[\#080D1A\]', 'bg-card'),
    (r'bg-\[\#06B6D4\]/10', 'bg-primary/10'),
    (r'border-\[\#06B6D4\]/30', 'border-primary/30'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'bg-\[\#060912\]', 'bg-background'),
    (r'bg-\[\#0B101D\]', 'bg-muted/40'),
    (r'border-\[\#00F0FF\]', 'border-cyan-400'),
    (r'bg-\[\#00FF66\]', 'bg-emerald-400'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/integrations/PipelineVisualizer.tsx", "w") as f:
    f.write(content)
