import re
import os

replacements = [
    # Global UI Colors
    (r'text-\[\#EDEDEF\]', 'text-foreground'),
    (r'text-\[\#8A8F98\]', 'text-muted-foreground'),
    (r'text-\[\#5E6AD2\]', 'text-primary'),
    (r'text-\[\#6872D9\]', 'text-primary'),
    (r'text-\[\#00F0FF\]', 'text-cyan-400'),
    (r'text-\[\#06B6D4\]', 'text-cyan-400'),
    (r'text-\[\#00FF66\]', 'text-emerald-400'),
    (r'text-\[\#38bdf8\]', 'text-sky-400'),
    (r'bg-\[\#5E6AD2\]', 'bg-primary'),
    (r'bg-\[\#060912\]', 'bg-background'),
    (r'bg-\[\#0B101D\]', 'bg-muted/40'),
    (r'bg-\[\#080D1A\]', 'bg-card'),
    (r'bg-\[\#0E1526\]', 'bg-muted/60'),
    (r'bg-\[\#06B6D4\]', 'bg-primary'),
    (r'bg-\[\#00F0FF\]', 'bg-cyan-400'),
    (r'bg-\[\#060914\]', 'bg-background'),
    (r'border-\[\#5E6AD2\]', 'border-primary'),
    (r'border-\[\#06B6D4\]', 'border-primary'),
    (r'ring-\[\#5E6AD2\]/50', 'ring-primary/50'),
    
    # White Opacities
    (r'bg-white/\[0\.02\]', 'bg-muted/20'),
    (r'bg-white/\[0\.03\]', 'bg-muted/30'),
    (r'bg-white/\[0\.04\]', 'bg-muted/40'),
    (r'bg-white/\[0\.05\]', 'bg-muted/50'),
    (r'bg-white/\[0\.06\]', 'bg-muted/60'),
    (r'bg-white/\[0\.08\]', 'bg-muted/80'),
    (r'border-white/\[0\.06\]', 'border-border'),
    (r'border-white/\[0\.1\]', 'border-border'),
    
    # Hover states
    (r'hover:text-\[\#EDEDEF\]', 'hover:text-foreground'),
    (r'hover:text-\[\#6872D9\]', 'hover:text-primary'),
    (r'hover:text-\[\#00F0FF\]', 'hover:text-cyan-400'),
    (r'hover:bg-\[\#5E6AD2\]', 'hover:bg-primary'),
    (r'hover:bg-\[\#00F0FF\]', 'hover:bg-cyan-400'),
    
    # Opacities
    (r'bg-\[\#5E6AD2\]/10', 'bg-primary/10'),
    (r'bg-\[\#5E6AD2\]/15', 'bg-primary/15'),
    (r'border-\[\#5E6AD2\]/30', 'border-primary/30'),
    (r'border-\[\#5E6AD2\]/50', 'border-primary/50'),
    (r'hover:border-\[\#5E6AD2\]/50', 'hover:border-primary/50'),
    (r'hover:bg-\[\#5E6AD2\]/15', 'hover:bg-primary/15'),
    (r'border-\[\#06B6D4\]/30', 'border-cyan-400/30'),
    (r'bg-\[\#06B6D4\]/10', 'bg-cyan-400/10'),
    
    # Specific missing ones
    (r'bg-\[\#0A0F20\]/90', 'bg-muted/40'),
    (r'bg-\[\#0A0F20\]/95', 'bg-muted/95'),
    (r'bg-\[\#0A0F20\]', 'bg-muted/40'),
    (r'via-\[\#0A0F20\]', 'via-muted/40'),
    (r'to-\[\#04060E\]', 'to-background'),
    (r'border-\[\#38bdf8\]/30', 'border-sky-400/30'),
    (r'text-\[\#38bdf8\]', 'text-sky-400'),
    (r'dark:bg-\[\#202124\]', 'dark:bg-background'),
    (r'border-\[\#dadce0\]', 'border-border'),
    
    # From gradient
    (r'from-\[\#00F0FF\]', 'from-cyan-400'),
]

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            if 'emailService' in path or 'RiskSslGaugeChart' in path or 'AuditScoreMatrixRadar' in path or 'UserAnalyticsDashboard' in path or 'EngineCharts' in path:
                continue
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            original_content = content
            for old, new in replacements:
                content = re.sub(old, new, content)
            if content != original_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

