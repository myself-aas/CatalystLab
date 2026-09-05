import re
import os

replacements = [
    (r'bg-\[\#0d1b2a\]', 'bg-background'),
    (r'hover:bg-\[\#1e2f4a\]', 'hover:bg-muted/80'),
    (r'bg-\[\#415a77\]', 'bg-muted-foreground'),
    (r'hover:bg-\[\#33475e\]', 'hover:bg-muted-foreground/80'),
    (r'hover:bg-\[\#52718e\]', 'hover:bg-muted-foreground/80'),
    (r'text-\[\#ebe9e6\]', 'text-foreground'),
    (r'bg-\[\#090D16\]', 'bg-card'),
    (r'bg-\[\#111726\]/95', 'bg-muted/80'),
    (r'bg-\[\#111726\]/80', 'bg-muted/40'),
]

files_to_fix = [
    "src/components/auth/ProtectedRoute.tsx",
    "src/components/auth/AdminRoute.tsx",
    "src/components/TerminalOutput.tsx",
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

