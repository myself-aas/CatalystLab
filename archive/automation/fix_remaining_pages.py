import re
import os

replacements = [
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'bg-\[\#5E6AD2\]/10', 'bg-primary/10'),
    (r'bg-\[\#5E6AD2\]/15', 'bg-primary/15'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
    (r'border-\[\#5E6AD2\]', 'border-primary'),
    (r'border-\[\#5E6AD2\]/30', 'border-primary/30'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'bg-white/\[0\.03\]', 'bg-muted/30'),
    (r'bg-white/\[0\.02\]', 'bg-muted/20'),
    (r'bg-white/\[0\.08\]', 'bg-muted/60'),
    (r'text-\[\#5E6AD2\]', 'text-primary'),
    (r'hover:text-\[\#EDEDEF\]', 'hover:text-foreground'),
    (r'hover:text-\[\#6872D9\]', 'hover:text-primary'),
    (r'hover:border-\[\#5E6AD2\]/50', 'hover:border-primary/50'),
    (r'hover:bg-\[\#5E6AD2\]/15', 'hover:bg-primary/15'),
    (r'text-\[\#38bdf8\]', 'text-sky-400'),
    (r'text-\[\#06B6D4\]', 'text-cyan-400'),
    (r'text-\[\#10B981\]', 'text-emerald-400'),
    (r'border-\[\#06B6D4\]/30', 'border-cyan-400/30'),
    (r'bg-\[\#06B6D4\]/10', 'bg-cyan-400/10'),
    (r'bg-white/\[0\.05\]', 'bg-muted/50'),
    (r'border-white/\[0\.1\]', 'border-border'),
]

files_to_fix = [
    "src/pages/docs/RateLimitingDoc.tsx",
    "src/components/ui/hover-footer.tsx",
    "src/components/common/EngineInput.tsx",
    "src/components/cards/primitives/PillCTA.tsx",
    "src/pages/SignUpPage.tsx",
    "src/pages/LoginPage.tsx",
    "src/pages/AboutPage.tsx",
]

for file_path in files_to_fix:
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r") as f:
        content = f.read()
    for old, new in replacements:
        content = re.sub(old, new, content)
    with open(file_path, "w") as f:
        f.write(content)

