import re
import os

replacements = [
    (r'focus-visible:ring-offset-\[\#050506\]', 'focus-visible:ring-offset-background'),
    (r'focus-visible:ring-\[\#5E6AD2\]', 'focus-visible:ring-primary'),
    (r'bg-\[\#6872D9\]', 'bg-primary/90'),
    (r'hover:bg-\[\#6872D9\]', 'hover:bg-primary/90'),
    (r'bg-\[\#060914\]', 'bg-background'),
    (r'bg-\[\#0A0F20\]/90', 'bg-muted/40'),
    (r'bg-\[\#0A0F20\]/95', 'bg-muted/95'),
    (r'bg-\[\#0A0F20\]', 'bg-muted/40'),
    (r'text-\[\#06B6D4\]', 'text-cyan-400'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'via-\[\#0A0F20\]', 'via-muted/40'),
    (r'to-\[\#04060E\]', 'to-background'),
    (r'border-\[\#030712\]', 'border-background'),
    (r'bg-\[\#0d1b2a\]', 'bg-background'),
    (r'from-\[\#00F0FF\]', 'from-cyan-400'),
    (r'via-\[\#06B6D4\]', 'via-cyan-500'),
    (r'to-\[\#00FF66\]', 'to-emerald-400'),
    (r'focus:ring-\[\#00F0FF\]', 'focus:ring-cyan-400'),
    (r'to-\[\#06B6D4\]', 'to-cyan-500'),
    (r"'#00F0FF'", "'hsl(var(--primary))'"),
]

files_to_fix = [
    "src/components/cards/primitives/PillCTA.tsx",
    "src/components/media/ScanRevealFigure.tsx",
    "src/components/media/CinematicVideo.tsx",
    "src/components/media/AvatarStack.tsx",
    "src/components/common/NewsletterModal.tsx",
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

