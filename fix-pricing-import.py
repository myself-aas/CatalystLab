with open("src/pages/PricingPage.tsx", "r") as f:
    lines = f.readlines()

with open("src/pages/PricingPage.tsx", "w") as f:
    for line in lines:
        if "{ useState } from 'react';" in line and "import React" not in line:
            continue
        f.write(line)
