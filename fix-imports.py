def force_add_import(file, statement):
    with open(file, "r") as f:
        content = f.read()
    if statement not in content:
        content = content.replace("import React, { useState } from 'react';", f"import React, {{ useState }} from 'react';\n{statement}")
        with open(file, "w") as f:
            f.write(content)

force_add_import("src/components/legal/PrivacySection.tsx", "import { GlobalFaqSection } from '../common/GlobalFaqSection';")
force_add_import("src/pages/ContactPage.tsx", "import { GlobalFaqSection } from '../components/common/GlobalFaqSection';")

