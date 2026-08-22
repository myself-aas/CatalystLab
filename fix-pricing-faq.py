import re

with open("src/pages/PricingPage.tsx", "r") as f:
    content = f.read()

pattern = re.compile(r"\{\/\*\s*FAQ Section\s*\*\/}.*?<\/div>\s*<\/main>", re.DOTALL)
replacement = """{/* FAQ Section */}
        <GlobalFaqSection 
          faqs={faqs.map(f => ({ question: f.q, answer: f.a }))}
          title="Frequently Asked Questions"
          subtitle="Answers to common questions about our plans, billing, and technical capabilities."
        />
      </main>"""

content = re.sub(pattern, replacement, content)

with open("src/pages/PricingPage.tsx", "w") as f:
    f.write(content)
