with open("src/pages/MasterAuditExecutionPage.tsx", "r") as f:
    content = f.read()

content = content.replace("const [targetUrl, setTargetUrl] = useState(initialUrlFromQuery);", "const [targetUrl, setTargetUrl] = useState(initialUrlFromQuery);\n  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'unreachable'>('idle');")

with open("src/pages/MasterAuditExecutionPage.tsx", "w") as f:
    f.write(content)
