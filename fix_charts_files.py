import re
import os

replacements = [
    (r'text-\[\#5E6AD2\]', 'text-primary'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
]

files_to_fix = [
    "src/components/charts/VitalsRadarOverview.tsx",
    "src/components/charts/DOMDepthChart.tsx",
    "src/components/tool/EngineReportDashboard.tsx",
    "src/components/media/ScanRevealFigure.tsx",
    "src/components/media/CinematicVideo.tsx",
    "src/components/media/AvatarStack.tsx",
    "src/components/layout/LinearAmbientBackground.tsx",
    "src/components/common/NewsletterModal.tsx",
    "src/components/auth/AdminRoute.tsx",
    "src/components/auth/ProtectedRoute.tsx",
    "src/pages/ComparePage.tsx",
    "src/components/ui/particles-bg.tsx",
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

