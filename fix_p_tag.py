import re

with open('src/components/common/HeroImageCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<p className="text-xs md:text-sm text-white/70 line-clamp-3 mt-2 max-w-lg">',
    '<div className="text-xs md:text-sm text-white/70 line-clamp-3 mt-2 max-w-lg">'
)
content = content.replace(
    '''{description}
                </p>''',
    '''{description}
                </div>'''
)

with open('src/components/common/HeroImageCard.tsx', 'w') as f:
    f.write(content)
