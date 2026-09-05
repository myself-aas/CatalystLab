import re
import os

replacements = [
    (r'bg-\[\#7c3aed\]', 'bg-purple-600'),
    (r'bg-\[\#4338ca\]', 'bg-indigo-700'),
    (r'ring-\[\#5E6AD2\]/20', 'ring-primary/20'),
    (r'hover:bg-\[\#6872D9\]', 'hover:bg-primary/90'),
    (r'dark:bg-\[\#0c0c12\]', 'dark:bg-background'),
    (r'dark:text-\[\#818cf8\]', 'dark:text-indigo-400'),
    (r'from-\[\#060911\]', 'from-background'),
    (r'bg-\[\#0D0D0D\]', 'bg-card'),
    (r'bg-\[\#415a77\]', 'bg-muted-foreground'),
    (r'text-\[\#ebe9e6\]', 'text-foreground'),
    (r'hover:bg-\[\#162a45\]', 'hover:bg-muted/80'),
    (r'focus:border-\[\#415a77\]', 'focus:border-border'),
    (r'focus:ring-\[\#415a77\]/30', 'focus:ring-ring/30'),
]

files_to_fix = [
    "src/components/layout/LinearAmbientBackground.tsx",
    "src/components/common/EngineInput.tsx",
    "src/components/common/BrandLogo.tsx",
    "src/components/cards/marketing/CatalystCarouselRail.tsx",
    "src/components/cards/atomic/TrailCardHeader.tsx",
    "src/components/admin/SystemHealthWidget.tsx",
    "src/components/admin/ContactInquiriesAdminView.tsx",
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

