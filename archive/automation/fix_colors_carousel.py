import re

with open("src/components/ui/3-d-coverflow-carousel.tsx", "r") as f:
    content = f.read()

# Replacements
replacements = [
    (r'backgroundColor: "\#0c0a09"', 'backgroundColor: "hsl(var(--background))"'),
    (r'color: "\#ffffff"', 'color: "hsl(var(--foreground))"'),
    (r'color: "\#f3f0ea"', 'color: "hsl(var(--foreground))"'),
    (r'backgroundColor: "\#171311"', 'backgroundColor: "hsl(var(--card))"'),
    (r'backgroundColor: "\#c5a880"', 'backgroundColor: "hsl(var(--primary))"'),
    (r'color: "\#c5a880"', 'color: "hsl(var(--primary))"'),
    (r'background: "linear-gradient\(90deg, transparent, \#c5a880\)"', 'background: "linear-gradient(90deg, transparent, hsl(var(--primary)))"'),
    (r'background: "linear-gradient\(90deg, \#c5a880, transparent\)"', 'background: "linear-gradient(90deg, hsl(var(--primary)), transparent)"'),
    (r'background: "linear-gradient\(135deg, \#c5a880 0%, \#a48256 100%\)"', 'background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)"'),
    (r'color: "\#110d0c"', 'color: "hsl(var(--primary-foreground))"'),
    (r'backgroundColor: idx === currentIndex \? "\#c5a880" : "rgba\(255,255,255,0\.25\)"', 'backgroundColor: idx === currentIndex ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("src/components/ui/3-d-coverflow-carousel.tsx", "w") as f:
    f.write(content)
