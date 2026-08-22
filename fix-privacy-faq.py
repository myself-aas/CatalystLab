import re

with open("src/components/legal/PrivacySection.tsx", "r") as f:
    content = f.read()

pattern = re.compile(r"\{\/\*\s*Privacy FAQ Accordion\s*\*\/}.*?<\/LazyReveal>", re.DOTALL)
replacement = """{/* Privacy FAQ Accordion */}
      <LazyReveal direction="up">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <GlobalFaqSection 
            faqs={faqs.map(f => ({ question: f.q, answer: f.a }))}
            title="Frequently Asked Privacy Questions"
            subtitle="Answers regarding data retention, GDPR compliance, and telemetry handling."
          />
        </div>
      </LazyReveal>"""

content = re.sub(pattern, replacement, content, count=1)

if "GlobalFaqSection" not in content and "import { GlobalFaqSection" not in content:
    content = content.replace("import React,", "import React, { useState } from 'react';\nimport { GlobalFaqSection } from '../common/GlobalFaqSection';\n")

with open("src/components/legal/PrivacySection.tsx", "w") as f:
    f.write(content)
