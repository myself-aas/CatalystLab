import re

with open('src/components/tool/EngineReportDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add import
import_stmt = "import { EngineCharts } from './EngineCharts';\n"
content = content.replace("import type { EngineType }", import_stmt + "import type { EngineType }")

# 2. Add extractMetrics
extract_metrics_code = """
const extractMetrics = (output: string) => {
  try {
    const match = output.match(/---CATALYST_METRICS---\\n({[\\s\\S]*})/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  } catch (e) {
    console.error("Failed to parse metrics", e);
  }
  return null;
};
"""
content = content.replace("export const EngineReportDashboard:", extract_metrics_code + "\nexport const EngineReportDashboard:")

# 3. Modify metrics init
old_init = """
  const meta = ENGINES_MAP[engineType];
  const metrics = generateMetrics(targetUrl);
"""
new_init = """
  const meta = ENGINES_MAP[engineType];
  const baseMetrics = generateMetrics(targetUrl);
  const parsedPythonMetrics = extractMetrics(output);
  const metrics = { ...baseMetrics, ...parsedPythonMetrics };
"""
content = content.replace(old_init, new_init)

# 4. Replace the 3 hardcoded dashboards
# The start is `      {/* 2. Three Unique PowerBI-style Dashboards */}`
# The end is `      {/* 3. Recommendations & Code Snippets */}`

pattern = r"\{\/\* 2\. Three Unique PowerBI-style Dashboards \*\/\}.*?(?=\{\/\* 3\. Recommendations & Code Snippets \*\/\})"
replacement = "{/* 2. Three Unique PowerBI-style Dashboards */}\n      <EngineCharts engineType={engineType} metrics={metrics} />\n\n      "

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/tool/EngineReportDashboard.tsx', 'w') as f:
    f.write(content)

