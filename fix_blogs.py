import re

with open('src/components/home/LatestBlogsSection.tsx', 'r') as f:
    content = f.read()

# Replace gradientFrom with bottomGradientClasses and add overlayStyle="solid"
content = content.replace('gradientFrom="from-slate-950"', 'overlayStyle="solid" bottomGradientClasses="from-slate-900 via-slate-900/90"')
content = content.replace('gradientFrom="from-slate-900"', 'overlayStyle="solid" bottomGradientClasses="from-slate-900 via-slate-900/90"')

with open('src/components/home/LatestBlogsSection.tsx', 'w') as f:
    f.write(content)
