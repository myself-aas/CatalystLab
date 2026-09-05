import re
import os

replacements = [
    (r'text-\[\#5E6AD2\]', 'text-primary'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'ring-\[\#5E6AD2\]/50', 'ring-primary/50'),
    (r'bg-\[\#5E6AD2\]/10', 'bg-primary/10'),
    (r'border-\[\#5E6AD2\]', 'border-primary'),
]

files_to_fix = [
    "src/pages/docs/SecurityDoc.tsx",
    "src/pages/docs/ScoringMatrixDoc.tsx",
    "src/pages/docs/VitalZymeDoc.tsx",
    "src/pages/docs/GitLygaseDoc.tsx",
    "src/pages/docs/EdgeVmaxDoc.tsx",
    "src/pages/docs/CicdDevOpsDoc.tsx",
    "src/pages/docs/SynthShiftDoc.tsx",
    "src/pages/docs/OrchestratorDoc.tsx",
    "src/pages/docs/EcoHoloDoc.tsx",
    "src/pages/docs/ApiReferenceDoc.tsx",
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

