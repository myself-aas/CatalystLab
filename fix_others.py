import re

with open('src/components/home/FeaturedAuditMetrics.tsx', 'r') as f:
    content = f.read()
content = content.replace('gradientFrom="from-slate-950"', 'overlayStyle="glass"')
with open('src/components/home/FeaturedAuditMetrics.tsx', 'w') as f:
    f.write(content)

with open('src/components/user/UserAnalyticsDashboard.tsx', 'r') as f:
    content = f.read()
content = content.replace('gradientFrom="from-slate-950"', 'overlayStyle="glass"')
with open('src/components/user/UserAnalyticsDashboard.tsx', 'w') as f:
    f.write(content)
