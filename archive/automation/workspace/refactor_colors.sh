#!/bin/bash

# Find and replace Tailwind slate classes
find src server -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs sed -i \
  -e 's/bg-\[#f8fafc\]/bg-background/g' \
  -e 's/bg-\[#f1f5f9\]/bg-muted/g' \
  -e 's/border-\[#e2e8f0\]/border-border/g' \
  -e 's/text-\[#64748b\]/text-muted-foreground/g' \
  -e 's/text-\[#415a77\]/text-muted-foreground/g' \
  -e 's/text-\[#0b192c\]/text-foreground/g' \
  -e 's/divide-slate-200/divide-border/g' \
  -e 's/ring-slate-900/ring-ring/g' \
  -e 's/ring-slate-500/ring-ring/g' \
  -e 's/ring-slate-400/ring-ring/g' \
  -e 's/from-slate-800/from-background/g' \
  -e 's/to-slate-800/to-background/g' \
  -e 's/from-slate-950/from-background/g' \
  -e 's/placeholder-slate-300/placeholder-muted-foreground/g' \
  -e 's/placeholder-slate-400/placeholder-muted-foreground/g' \
  -e 's/focus-visible:ring-slate-[0-9]\{3\}/focus-visible:ring-ring/g' \
  -e 's/#33415515/var(--app-border)/g' \
  -e 's/bg-\[radial-gradient(ellipse_80%_60%_at_50%_-10%,#ffffff_0%,#f8fafc_65%,#f1f5f9_100%)\]/bg-\[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--app-card)_0%,var(--app-background)_65%,var(--app-muted)_100%)\]/g'

echo "Refactoring colors completed."
