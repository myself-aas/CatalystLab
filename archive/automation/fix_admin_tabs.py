import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    orig = content
    
    # Let's replace the tab link structure in AdminDashboardPage
    # From: border-b-2 px-4 py-2 ... border-black text-foreground : border-transparent ...
    # To: rounded-lg py-1.5 px-3 text-xs font-bold transition-all ... bg-primary text-primary-foreground shadow-sm border border-border : bg-background ds-muted hover:text-foreground hover:bg-muted border border-border
    
    content = content.replace("border-b-2 px-4 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer", "rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer")
    
    content = content.replace("isMonitoring\n                    ? 'border-black text-foreground'\n                    : 'border-transparent ds-muted hover:text-foreground'", "isMonitoring\n                    ? 'bg-primary text-primary-foreground shadow-sm border border-border'\n                    : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'")
    content = content.replace("isBlogs\n                    ? 'border-black text-foreground'\n                    : 'border-transparent ds-muted hover:text-foreground'", "isBlogs\n                    ? 'bg-primary text-primary-foreground shadow-sm border border-border'\n                    : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'")
    content = content.replace("isInquiries\n                    ? 'border-black text-foreground'\n                    : 'border-transparent ds-muted hover:text-foreground'", "isInquiries\n                    ? 'bg-primary text-primary-foreground shadow-sm border border-border'\n                    : 'bg-background ds-muted hover:text-foreground hover:bg-muted border border-border'")
    
    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed admin tabs in {filepath}")

fix_file('src/pages/AdminDashboardPage.tsx')

