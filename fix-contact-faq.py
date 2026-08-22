import re

with open("src/pages/ContactPage.tsx", "r") as f:
    content = f.read()

pattern = re.compile(r"\{\/\*\s*Quick Resolution Knowledge Base Accordion\s*\*\/}.*?<\/LazyReveal>", re.DOTALL)
replacement = """{/* Quick Resolution Knowledge Base Accordion */}
        <LazyReveal direction="up">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
            <GlobalFaqSection 
              faqs={faqs.map(f => ({ question: f.q, answer: f.a }))}
              title="Instant Answers & Diagnostic Troubleshooting"
              subtitle="Quick solutions to common technical issues."
            />
          </div>
        </LazyReveal>"""

content = re.sub(pattern, replacement, content, count=1)

with open("src/pages/ContactPage.tsx", "w") as f:
    f.write(content)
