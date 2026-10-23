import React, { useState } from 'react';
import { Send, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authorizedFetch } from '../../lib/authHeaders';
import { ENGINES_MAP, ENGINE_ORDER } from '../../data/engines';

type RequestState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'ok'; status: number; body: string }
  | { kind: 'failed'; status: number | null; message: string };

/**
 * Live API console.
 *
 * It calls the same `POST /api/v1/engines/{engine}/scan` endpoint the docs
 * describe and prints whatever that endpoint returns — including errors.
 * There is no simulated response: a console that invents output teaches the
 * wrong thing about the API.
 */
export const ApiPlayground: React.FC = () => {
  const [engine, setEngine] = useState('health');
  const [target, setTarget] = useState('');
  const [state, setState] = useState<RequestState>({ kind: 'idle' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = target.trim();
    if (!trimmed) return;

    setState({ kind: 'running' });

    try {
      const response = await authorizedFetch(`/api/v1/engines/${engine}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const text = await response.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // Not JSON: show the raw body rather than pretending it parsed.
      }

      if (!response.ok) {
        setState({
          kind: 'failed',
          status: response.status,
          message: pretty || `The API answered with HTTP ${response.status}.`,
        });
        return;
      }

      setState({ kind: 'ok', status: response.status, body: pretty });
    } catch {
      setState({
        kind: 'failed',
        status: null,
        message: 'The request did not reach CatalystLab. Check your connection and send it again.',
      });
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-4">
        <h3 className="text-base font-medium text-foreground">Send one request</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Calls <code className="font-mono text-xs">POST /api/v1/engines/&lt;engine&gt;/scan</code> and
          prints the response. It counts against your daily scan allowance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label htmlFor="api-engine" className="mb-1.5 block text-sm font-medium text-foreground">Engine</label>
            <select
              id="api-engine"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className="ds-select w-full bg-background text-sm"
            >
              {ENGINE_ORDER.map((id) => (
                <option key={id} value={id}>
                  {`${id} — ${ENGINES_MAP[id]?.name ?? 'Engine'}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="api-target" className="mb-1.5 block text-sm font-medium text-foreground">Target URL</label>
            <input
              id="api-target"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="https://example.com"
              className="ds-input w-full bg-background font-mono text-sm"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Publicly reachable URLs only; private addresses are rejected by the SSRF guard.
            </p>
          </div>

          <button
            type="submit"
            disabled={state.kind === 'running' || !target.trim()}
            className="ds-btn ds-btn-primary w-full text-sm disabled:opacity-50"
          >
            <Send className="size-4 shrink-0" aria-hidden="true" />
            <span>{state.kind === 'running' ? 'Sending…' : 'Send request'}</span>
          </button>
        </form>

        <div className="flex min-h-[260px] flex-col rounded-xl border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-foreground">
            <Terminal className="size-4 shrink-0 text-info" aria-hidden="true" />
            Response
            {state.kind === 'ok' && <span className="ml-auto font-mono text-xs text-success">HTTP {state.status}</span>}
            {state.kind === 'failed' && state.status !== null && (
              <span className="ml-auto font-mono text-xs text-danger">HTTP {state.status}</span>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
            {state.kind === 'idle' && (
              <p className="font-sans text-sm text-muted-foreground">
                Send a request and its JSON response appears here.
              </p>
            )}

            {state.kind === 'running' && (
              <p className="font-sans text-sm text-muted-foreground" role="status">Waiting for the engine…</p>
            )}

            {state.kind === 'ok' && (
              <pre className="whitespace-pre-wrap break-words text-foreground">{state.body}</pre>
            )}

            {state.kind === 'failed' && (
              <div className="flex items-start gap-2 font-sans text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">The request was rejected</p>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">{state.message}</pre>
                </div>
              </div>
            )}
          </div>

          {state.kind === 'ok' && (
            <p className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
              The engine ran against the target you entered.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ApiPlayground;
