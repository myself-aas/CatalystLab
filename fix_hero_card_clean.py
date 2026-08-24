import re

with open('src/components/common/HeroImageCard.tsx', 'r') as f:
    content = f.read()

old_gradients = r"""      \{/\* Gradient Overlay \*/\}[\s\S]*?\{/\* Content Container \*/\}"""

new_gradients = """      {/* Gradient Overlay */}
      {/* Subtle full-card overlay just to ensure some contrast for top elements */}
      <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-black/0 pointer-events-none" />
      
      {/* A strong gradient specifically for the text area at the bottom to ensure readability */}
      <div className={`absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t ${gradientFrom} to-transparent pointer-events-none`} />
      
      {/* Content Container */}"""

new_content = re.sub(old_gradients, new_gradients, content)

with open('src/components/common/HeroImageCard.tsx', 'w') as f:
    f.write(new_content)
