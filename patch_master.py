import re

with open('src/pages/MasterAuditPage.tsx', 'r') as f:
    content = f.read()

import_statement = "import DemoOne from '../components/ui/demo';\nimport { SEOHead } from '../components/common/SEOHead';"
content = content.replace("import { SEOHead } from '../components/common/SEOHead';", import_statement)

demo_component = """        {/* 11. Final Conversion CTA & Instant Domain Scan */}
        <FinalCTA />

        {/* Custom Testimonial Integration */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center mb-12 text-black">New Cardview Integration</h2>
            <DemoOne />
          </div>
        </section>
      </div>"""
content = content.replace("        {/* 11. Final Conversion CTA & Instant Domain Scan */}\n        <FinalCTA />\n      </div>", demo_component)

with open('src/pages/MasterAuditPage.tsx', 'w') as f:
    f.write(content)
