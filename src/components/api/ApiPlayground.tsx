import React, { useState } from 'react';
import { Terminal, Send, Check } from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const [response, setResponse] = useState<string>('');

  const handleTest = () => {
    setResponse('{"status": "ok", "message": "Simulated successful API response", "data": {"latency": "42ms"}}');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-muted text-foreground rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">API Playground</h2>
          <p className="text-muted-foreground text-sm mt-1">Test your REST endpoints directly in the browser.</p>
        </div>
      </div>
      <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Request</h3>
          <div className="bg-accent p-4 rounded-lg mb-4 font-mono text-sm text-muted-foreground">
            POST /api/v1/audit/master
          </div>
          <button 
            onClick={handleTest}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium"
          >
            <Send className="w-4 h-4" /> Send Request
          </button>
        </div>
        <div className="w-full md:w-1/2 bg-primary p-6 flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" /> Response
          </h3>
          <div className="flex-1 bg-primary p-4 rounded-lg font-mono text-sm text-emerald-400 overflow-auto">
            {response ? (
              <pre>{JSON.stringify(JSON.parse(response), null, 2)}</pre>
            ) : (
              <span className="text-muted-foreground">Awaiting request...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
