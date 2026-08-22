with open("src/pages/MasterAuditExecutionPage.tsx", "r") as f:
    content = f.read()

content = content.replace("const [targetUrl, setTargetUrl] = useState<string>('');", "const [targetUrl, setTargetUrl] = useState<string>('');\n  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'unreachable'>('idle');")

with open("src/pages/MasterAuditExecutionPage.tsx", "w") as f:
    f.write(content)
