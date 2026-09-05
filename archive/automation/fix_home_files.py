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
    (r'text-\[\#EDEDEF\]/80', 'text-foreground/80'),
]

files_to_fix = [
    "src/components/home/HowItWorks.tsx",
    "src/components/home/EnzymeGrid.tsx",
    "src/components/home/FinalCTA.tsx",
    "src/components/home/SocialProof.tsx",
    "src/components/home/SevenDayTrialSection.tsx",
    "src/components/home/Testimonials.tsx",
    "src/components/home/WorkflowSection.tsx",
    "src/components/home/SectionHeader.tsx",
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

