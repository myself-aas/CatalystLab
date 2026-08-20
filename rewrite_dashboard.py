import re

with open('src/components/tool/EngineReportDashboard.tsx', 'r') as f:
    content = f.read()

# Add recharts imports
import_recharts = "import { \n  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, \n  AreaChart, Area, PieChart, Pie, Cell,\n  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,\n  ScatterChart, Scatter, ZAxis, ComposedChart\n} from 'recharts';"
content = re.sub(r"import \{[^}]*\} from 'recharts';", import_recharts, content)

# Add extractMetrics function before EngineReportDashboard definition
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

# Modify the first few lines of EngineReportDashboard
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

# Now, we need to replace the entire <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> block where the 3 dashboards are hardcoded.
# Let's find that block.
# Actually, I can use string replacement or just build it.

